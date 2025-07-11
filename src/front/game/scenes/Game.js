import Phaser from "phaser";
import { GridObject } from "../objects/gridObject";
import { ServerObject } from "../objects/serverObject";
import { ZombieObject } from "../objects/zombieObject";
import { EffectsObjects } from "../objects/effectsObject";
import { TurretObject } from "../objects/turretObject";
import {
  EventBus,
  GAME_START,
  GAME_STOP,
  GAME_CLEANUP,
  GAME_VICTORY,
  ZOMBIE_KILLED,
  LEVEL_CHANGE,
  GAME_TIME_REQUEST,
  GAME_TIME_RESPONSE,
  LEVEL_COMPLETED,
  LEVEL_NEXT,
  REORGANIZE_TURRETS,
} from "../EventBus";
import { BulletObject } from "../objects/bulletObject";
import { levels } from "../config/levels";
// Importar constante para el nombre de la fuente
const VT323_GENERIC = "VT323";

export class Game extends Phaser.Scene {
  constructor() {
    super({ key: "Game" });
    // Variables para estadísticas del juego
    this.gameStats = {
      zombiesKilled: 0,
      gameStartTime: null,
    };
    // Variables para manejo de niveles
    this.currentLevelIndex = 0;
    this.zombiesSpawned = 0;
    this.levelCompleted = false;

    // Array para almacenar los datos de tiempo de cada nivel completado
    this.levelData = [];

    // Variables para tracking de muertes de zombies del nivel actual
    this.currentLevelZombieDeaths = {
      byPlayer: 0,
      byCollision: 0,
      byTrap: 0,
    };

    // Variables para UI de nivel superado
    this.levelCompletedUI = null;
    this.levelCompletedBackground = null;
    this.levelCompletedText = null;
    this.nextLevelButton = null;
  }

  create() {
    // Personalizar el cursor para toda la escena de juego
    this.input.setDefaultCursor("crosshair");

    // Limpiar listeners previos para evitar duplicados
    this.cleanupEventListeners();

    // Inicializar estadísticas del juego
    this.gameStats.zombiesKilled = 0;
    this.gameStats.gameStartTime = Date.now();

    // Inicializar array de datos de tiempo de niveles
    this.levelData = [];

    // Inicializar contadores de muertes de zombies del nivel actual
    this.currentLevelZombieDeaths = {
      byPlayer: 0,
      byCollision: 0,
      byTrap: 0,
    };

    // Inicializar variables de nivel
    this.currentLevelIndex = 0;
    this.zombiesSpawned = 0;
    this.levelCompleted = false;

    // Emitir evento de inicio de juego
    EventBus.emit(GAME_START);

    // Escuchar eventos de zombies eliminados para actualizar estadísticas
    this.zombieKilledHandler = () => {
      this.gameStats.zombiesKilled++;
      this.currentLevelZombieDeaths.byPlayer++;
      this.checkLevelCompletion();
    };
    EventBus.on(ZOMBIE_KILLED, this.zombieKilledHandler);

    // Escuchar evento de cleanup para limpiar cuando se sale del juego
    this.gameCleanupHandler = () => {
      console.log("Game scene: Recibido evento de cleanup");
      this.forceCleanup();
    };
    EventBus.on(GAME_CLEANUP, this.gameCleanupHandler);

    this.level = levels[this.currentLevelIndex];

    // Emitir evento de nivel inicial
    EventBus.emit(LEVEL_CHANGE, this.currentLevelIndex + 1);

    this.cameras.main.setBackgroundColor("#1c1f2b");
    this.physics.resume();

    this.grid = new GridObject(this, this.level.gridCols);
    this.grid.createGrid();

    this.server = new ServerObject(
      this,
      this.level.serverHealth,
      this.level.gridCols,
      this.level.serverCols
    );
    this.server.createServers();

    this.zombies = this.physics.add.group();

    // Limpiar cualquier zombie previo (por si quedan de sesiones anteriores)
    this.zombies.clear(true, true);

    this.zombieManager = new ZombieObject(
      this,
      this.level.zombieVelocityY,
      this.level.zombieHealth,
      this.level.zombieDamage
    );
    // Crear el primer zombie con los parámetros correctos
    const firstZombie = this.zombieManager.createZombie(
      this.level.zombieVelocityY,
      this.level.zombieHealth,
      this.level.zombieDamage
    );
    // Incrementar contador si se creó exitosamente
    if (firstZombie) {
      this.zombiesSpawned++;
    }

    this.turret = new TurretObject(
      this,
      this.level.turretHealth,
      this.level.turretsCount,
      this.level.turretsCols
    );
    this.turret.createTurrets();

    this.bulletManager = new BulletObject(this);
    this.effects = new EffectsObjects(this);
    this.effects.resetEmitters();

    // Limpiar cualquier listener previo y configurar el nuevo
    EventBus.removeAllListeners(REORGANIZE_TURRETS);

    // Escuchar evento para reorganizar torretas
    this.reorganizeTurretsHandler = (data) => {
      this.turret.reorganizeTurrets(data.justifyClass);
    };
    EventBus.on(REORGANIZE_TURRETS, this.reorganizeTurretsHandler);

    this.bgMusic = this.sound.add("closeEncounter4", {
      loop: true,
      volume: 0.8, // Ajusta el volumen entre 0 y 1
    });
    this.bgMusic.play();

    // --- COLISIÓN ZOMBIE-SERVER ---
    this.physics.add.collider(
      this.zombies,
      this.server.servers,
      (server, zombie) => {
        this.effects.bloodEmitter(zombie);
        this.effects.sparkEmitter(server);
        this.server.receiveDamage(
          this,
          server,
          Number(zombie.getData("damage"))
        );
        this.currentLevelZombieDeaths.byCollision++;
        this.zombieManager.destroyZombie(zombie, false); // No contar como kill
        this.sound.play("zombieDead2");
      },
      null,
      this
    );
    // --- COLISIÓN ZOMBIE-TURRET ---
    this.physics.add.collider(
      this.zombies,
      this.turret.turrets,
      (turret, zombie) => {
        this.effects.bloodEmitter(zombie, 0, -15);
        this.effects.explosionFireEmitter(turret);
        this.turret.receiveDamage(
          this,
          turret,
          Number(zombie.getData("damage"))
        );
        this.currentLevelZombieDeaths.byCollision++;
        this.zombieManager.destroyZombie(zombie, false); // No contar como kill
        this.sound.play("zombieDead2");
      },
      null,
      this
    );

    // --- DISPARO AUTOMÁTICO DE TORRETAS ---
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.turret.turrets.forEach((turret) => {
          const turretCol = turret.getData("col");
          const zombiesInCol = this.zombies
            .getChildren()
            .filter((zombie) => zombie.getData("col") === turretCol);
          if (zombiesInCol.length > 0) {
            this.bulletManager.fireBullet(
              this,
              turret,
              this.level.bulletDamage,
              this.level.bulletVelocityY
            );
          }
        });
      },
      loop: true,
    });

    // --- COLISIÓN BALA-ZOMBIE ---
    this.physics.add.overlap(
      this.bulletManager.bullets,
      this.zombies,
      (bullet, zombie) => {
        const damage = bullet.getData("damage");
        this.zombieManager.receiveDamage(this, zombie, damage);
        const emitter = bullet.getData("rocketEmitter");
        if (emitter) emitter.destroy();
        bullet.destroy();
      },
      null,
      this
    );

    // --- GENERACIÓN AUTOMÁTICA DE ZOMBIES ---
    this.time.addEvent({
      delay: 500,
      callback: () => {
        if (
          this.zombies.getChildren().length < this.level.maxZombiesOnScreen &&
          this.server.servers.length > 0 &&
          this.zombiesSpawned < this.level.zombiesPerLevel &&
          !this.levelCompleted
        ) {
          const newZombie = this.zombieManager.createZombie(
            this.level.zombieVelocityY,
            this.level.zombieHealth,
            this.level.zombieDamage
          );
          // Si se pudo crear el zombie, incrementar contador
          if (newZombie) {
            this.zombiesSpawned++;
          } else {
            console.log(
              "No se puede crear zombie: no hay servidores disponibles"
            );
          }
        }
      },
      loop: true,
    });
  }

  update() {
    // Actualizar barras de vida de zombies
    if (this.zombieUpdatables) {
      this.zombieUpdatables = this.zombieUpdatables.filter(
        (zombie) => zombie.active
      );
      this.zombieUpdatables.forEach((zombie) => {
        if (zombie.update) zombie.update();
      });
    }

    // Debug: Verificar si hay zombies fuera de la pantalla visible
    let zombiesOutOfBounds = 0;
    this.zombies.children.iterate((zombie) => {
      if (zombie && zombie.active) {
        // Contar zombies que están fuera del área visible pero no completamente fuera
        if (zombie.y < 0 || zombie.y > this.sys.game.config.height) {
          zombiesOutOfBounds++;
        }
      }
    });

    // Destruir zombies que salen de la pantalla
    this.zombies.children.iterate((zombie) => {
      if (zombie && zombie.active) {
        // Los zombies se mueven hacia arriba (velocidad Y negativa)
        // Si el zombie sale por arriba de la pantalla, destruirlo
        if (zombie.y < -50) {
          this.zombieManager.destroyZombie(zombie, false); // No contar como kill
        }
        // Si el zombie sale por abajo de la pantalla (por si hay algún error), destruirlo
        else if (zombie.y > this.sys.game.config.height + 100) {
          this.zombieManager.destroyZombie(zombie, false); // No contar como kill
        }
      }
    });

    // Mover y destruir balas fuera de pantalla
    this.bulletManager.bullets.children.iterate((bullet) => {
      if (bullet && bullet.active) {
        if (bullet.y > this.sys.game.config.height) {
          const emitter = bullet.getData("rocketEmitter");
          if (emitter) emitter.destroy();
          bullet.destroy();
        }
      }
    });

    // Verificar si el nivel se ha completado
    this.checkLevelCompletion();
  }

  // Verificar si el nivel se ha completado
  checkLevelCompletion() {
    // Verificar que el nivel existe y está definido
    if (!this.level) {
      console.warn("checkLevelCompletion: nivel no definido");
      return;
    }

    // Verificar si todos los zombies han sido spawneados y eliminados
    if (
      this.zombiesSpawned === this.level.zombiesPerLevel &&
      this.zombies.getChildren().length === 0 &&
      !this.levelCompleted
    ) {
      this.levelCompleted = true;
      console.log(`¡Nivel ${this.currentLevelIndex + 1} completado!`);

      // Mostrar UI de nivel superado
      this.time.delayedCall(1000, () => {
        this.createLevelCompletedUI();
      });
    }
  }

  // Avanzar al siguiente nivel
  nextLevel() {
    // Limpiar listeners del nivel anterior
    this.cleanupEventListeners();

    if (this.currentLevelIndex < levels.length - 1) {
      this.currentLevelIndex++;
      this.zombiesSpawned = 0;
      this.levelCompleted = false;

      // Resetear contadores de muertes de zombies para el nuevo nivel
      this.currentLevelZombieDeaths = {
        byPlayer: 0,
        byCollision: 0,
        byTrap: 0,
      };

      // Actualizar configuración del nivel
      this.level = levels[this.currentLevelIndex];

      // Emitir evento de cambio de nivel
      EventBus.emit(LEVEL_CHANGE, this.currentLevelIndex + 1);

      // Emitir evento para reanudar el tiempo
      EventBus.emit(LEVEL_NEXT);

      console.log(`Iniciando nivel ${this.currentLevelIndex + 1}`);

      // Recrear elementos del juego con nuevos parámetros
      this.recreateGameElements();

      // Reconfigurar listener de zombies para el nuevo nivel
      this.zombieKilledHandler = () => {
        this.gameStats.zombiesKilled++;
        this.currentLevelZombieDeaths.byPlayer++;
        this.checkLevelCompletion();
      };
      EventBus.on(ZOMBIE_KILLED, this.zombieKilledHandler);

      // Reconfigurar listener de reorganizar torretas para el nuevo nivel
      this.reorganizeTurretsHandler = (data) => {
        this.turret.reorganizeTurrets(data.justifyClass);
      };
      EventBus.on(REORGANIZE_TURRETS, this.reorganizeTurretsHandler);
    } else {
      // Todos los niveles completados - victoria
      console.log("¡Todos los niveles completados! ¡Victoria!");
      EventBus.emit(GAME_VICTORY);
      this.createVictoryUI();
    }
  }

  // Recrear elementos del juego para el nuevo nivel
  recreateGameElements() {
    // Limpiar zombies existentes
    this.zombies.clear(true, true);

    // Limpiar todas las balas existentes y sus efectos
    if (this.bulletManager && this.bulletManager.bullets) {
      this.bulletManager.bullets.children.iterate((bullet) => {
        if (bullet && bullet.active) {
          // Destruir emisor de efectos si existe
          const emitter = bullet.getData("rocketEmitter");
          if (emitter && emitter.destroy) {
            emitter.destroy();
          }
          bullet.destroy();
        }
      });
      this.bulletManager.bullets.clear(true, true);
    }

    // Limpiar todos los efectos visuales y sus emisores
    if (this.effects) {
      this.effects.resetEmitters();
    }

    // Limpiar todas las partículas restantes en la escena
    if (this.children) {
      this.children.list.forEach((child) => {
        if (child && child.type === "ParticleEmitter") {
          child.destroy();
        }
      });
    }

    // Recrear servidores con nueva salud
    this.server.servers.forEach((server) => {
      server.setData("health", this.level.serverHealth);
      server.setData("maxHealth", this.level.serverHealth);
      // Actualizar visualmente la barra de vida si existe
      if (server.healthBar) {
        server.healthBar.setScale(1, 1);
      }
    });

    // Recrear torretas con nueva salud
    this.turret.turrets.forEach((turret) => {
      turret.setData("health", this.level.turretHealth);
      turret.setData("maxHealth", this.level.turretHealth);
      // Actualizar visualmente la barra de vida si existe
      if (turret.healthBar) {
        turret.healthBar.setScale(1, 1);
      }
    });

    // Actualizar el zombie manager con los nuevos parámetros
    this.zombieManager.zombieVelocityY = this.level.zombieVelocityY;
    this.zombieManager.zombieHealth = this.level.zombieHealth;
    this.zombieManager.zombieDamage = this.level.zombieDamage;
  }

  shutdown() {
    console.log("Game scene: Ejecutando shutdown...");

    // Emitir evento de parar el juego
    EventBus.emit(GAME_STOP);

    // Ejecutar limpieza forzada
    this.forceCleanup();
  }

  // Método para limpiar listeners de eventos
  cleanupEventListeners() {
    // Limpiar listener de reorganizar torretas
    if (this.reorganizeTurretsHandler) {
      EventBus.removeListener(
        REORGANIZE_TURRETS,
        this.reorganizeTurretsHandler
      );
      this.reorganizeTurretsHandler = null;
    }

    // Limpiar listener de zombies eliminados
    if (this.zombieKilledHandler) {
      EventBus.removeListener(ZOMBIE_KILLED, this.zombieKilledHandler);
      this.zombieKilledHandler = null;
    }

    // Limpiar listener de cleanup
    if (this.gameCleanupHandler) {
      EventBus.removeListener(GAME_CLEANUP, this.gameCleanupHandler);
      this.gameCleanupHandler = null;
    }
  }

  // Método para forzar limpieza completa cuando se sale del juego
  forceCleanup() {
    console.log("Game scene: Iniciando limpieza forzada...");

    // Detener música de fondo inmediatamente
    if (this.bgMusic && this.bgMusic.isPlaying) {
      this.bgMusic.stop();
      this.bgMusic.destroy();
      this.bgMusic = null;
    }

    // Detener todos los sonidos
    if (this.sound) {
      this.sound.stopAll();
    }

    // Limpiar todos los grupos de physics
    if (this.zombies) {
      this.zombies.clear(true, true);
    }

    // Limpiar balas y sus efectos
    if (this.bulletManager && this.bulletManager.bullets) {
      this.bulletManager.bullets.children.iterate((bullet) => {
        if (bullet && bullet.active) {
          // Destruir emisor de efectos si existe
          const emitter = bullet.getData("rocketEmitter");
          if (emitter && emitter.destroy) {
            emitter.destroy();
          }
        }
      });
      this.bulletManager.bullets.clear(true, true);
    }

    // Limpiar efectos
    if (this.effects) {
      this.effects.resetEmitters();
    }

    // Limpiar todas las partículas restantes en la escena
    if (this.children) {
      this.children.list.forEach((child) => {
        if (child && child.type === "ParticleEmitter") {
          child.destroy();
        }
      });
    }

    // Detener todos los timers
    if (this.time) {
      this.time.removeAllEvents();
    }

    // Limpiar UIs
    this.hideLevelCompletedUI();

    // Limpiar listeners
    this.cleanupEventListeners();

    // Pausar physics para evitar errores
    if (this.physics) {
      this.physics.pause();
    }

    console.log("Game scene: Limpieza forzada completada");
  }

  // Crear UI de nivel superado
  createLevelCompletedUI() {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    // Emitir evento de nivel completado para pausar el tiempo
    EventBus.emit(LEVEL_COMPLETED);

    // Solicitar el tiempo de juego actual al componente Stats
    EventBus.once(GAME_TIME_RESPONSE, (timeData) => {
      // Calcular el tiempo del nivel actual restando el tiempo de los niveles anteriores
      const previousLevelsTime = this.levelData.reduce(
        (total, level) => total + (level.timeInSeconds || 0),
        0
      );
      const currentLevelTime = timeData.seconds - previousLevelsTime;

      // Calcular los zombies killed del nivel actual restando los zombies de los niveles anteriores
      const previousLevelsZombiesByPlayer = this.levelData.reduce(
        (total, level) => total + (level.zombieDeathStats?.byPlayer || 0),
        0
      );
      const currentLevelZombiesByPlayer =
        this.gameStats.zombiesKilled - previousLevelsZombiesByPlayer;

      // Agregar timeData al array con información del nivel
      this.levelData.push({
        level: this.currentLevelIndex + 1,
        timeInSeconds: currentLevelTime,
        zombieDeathStats: {
          byPlayer: this.currentLevelZombieDeaths.byPlayer,
          byCollision: this.currentLevelZombieDeaths.byCollision,
          byTrap: this.currentLevelZombieDeaths.byTrap,
        },
        totalZombiesKilled: this.gameStats.zombiesKilled,
        totalTime: timeData.seconds,
      });

      console.log(
        "Nivel completado - Datos agregados:",
        this.levelData[this.levelData.length - 1]
      );
      console.log("Array completo de niveles:", this.levelData);

      // Crear fondo semitransparente
      this.levelCompletedBackground = this.add.rectangle(
        centerX,
        centerY,
        this.sys.game.config.width,
        this.sys.game.config.height,
        0x000000,
        0.7
      );

      // Crear contenedor para la UI
      this.levelCompletedUI = this.add.container(centerX, centerY);

      // Crear panel de fondo
      const panel = this.add.rectangle(0, 0, 400, 300, 0x2a2a2a, 0.9);
      panel.setStrokeStyle(3, 0x00ff00);

      // Crear texto de nivel superado
      this.levelCompletedText = this.add.text(
        0,
        -80,
        `¡Level ${this.currentLevelIndex + 1} complete!`,
        {
          fontSize: "36px",
          fill: "#00ff00",
          fontFamily: VT323_GENERIC,
          fontStyle: "bold",
          align: "center",
        }
      );
      this.levelCompletedText.setOrigin(0.5);

      // Crear texto de estadísticas
      const statsText = this.add.text(
        0,
        -30,
        `Zombies killed by player: ${this.currentLevelZombieDeaths.byPlayer}\nZombies killed by collision: ${this.currentLevelZombieDeaths.byCollision}`,
        {
          fontSize: "20px",
          fill: "#ffffff",
          fontFamily: VT323_GENERIC,
          align: "center",
        }
      );
      statsText.setOrigin(0.5);

      // Agregar texto de tiempo de juego (tiempo del nivel actual)
      const timeText = this.add.text(0, 10, `Time: ${currentLevelTime}s`, {
        fontSize: "26px",
        fill: "#ffffff",
        fontFamily: VT323_GENERIC,
        align: "center",
      });
      timeText.setOrigin(0.5);

      // Crear botón "Next Level"
      this.nextLevelButton = this.add.rectangle(0, 80, 200, 50, 0x00aa00);
      this.nextLevelButton.setStrokeStyle(2, 0x00ff00);
      this.nextLevelButton.setInteractive({ useHandCursor: true });

      const buttonText = this.add.text(0, 80, "Next Level", {
        fontSize: "26px",
        fill: "#ffffff",
        fontFamily: VT323_GENERIC,
      });
      buttonText.setOrigin(0.5);

      // Agregar elementos al contenedor
      this.levelCompletedUI.add([
        panel,
        this.levelCompletedText,
        statsText,
        timeText,
        this.nextLevelButton,
        buttonText,
      ]);

      // Configurar evento del botón
      this.nextLevelButton.on("pointerdown", () => {
        this.hideLevelCompletedUI();
        this.nextLevel();
      });

      // Efectos de hover para el botón
      this.nextLevelButton.on("pointerover", () => {
        this.nextLevelButton.setFillStyle(0x00cc00);
      });

      this.nextLevelButton.on("pointerout", () => {
        this.nextLevelButton.setFillStyle(0x00aa00);
      });

      // Hacer visible la UI
      this.levelCompletedUI.setVisible(true);
      this.levelCompletedBackground.setVisible(true);
      this.bgMusic.pause();
      //this.sound.play("popupOpen");

      // Pausar el juego
      this.physics.pause();
    });

    // Emitir evento para solicitar el tiempo de juego
    EventBus.emit(GAME_TIME_REQUEST);
  }

  // Ocultar UI de nivel superado
  hideLevelCompletedUI() {
    if (this.levelCompletedUI) {
      this.levelCompletedUI.setVisible(false);
      this.levelCompletedUI.destroy();
      this.levelCompletedUI = null;
    }
    if (this.levelCompletedBackground) {
      this.levelCompletedBackground.setVisible(false);
      this.levelCompletedBackground.destroy();
      this.levelCompletedBackground = null;
    }

    // Reanudar el juego
    //this.sound.play("popupClose");
    this.bgMusic.resume();
    this.physics.resume();
  }

  // Crear UI de victoria (todos los niveles completados)
  createVictoryUI() {
    EventBus.emit(GAME_STOP);
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    // Crear fondo semitransparente
    this.levelCompletedBackground = this.add.rectangle(
      centerX,
      centerY,
      this.sys.game.config.width,
      this.sys.game.config.height,
      0x000000,
      0.8
    );

    // Crear contenedor para la UI
    this.levelCompletedUI = this.add.container(centerX, centerY);

    // Crear panel de fondo (aumentar altura para acomodar todo el contenido)
    const panel = this.add.rectangle(0, 0, 600, 400, 0x1a1a1a, 0.95);
    panel.setStrokeStyle(4, 0xffd700);

    // Crear texto de victoria
    const victoryText = this.add.text(0, -120, "Victory!", {
      fontSize: "48px",
      fill: "#ffd700",
      fontFamily: VT323_GENERIC,
      fontStyle: "bold",
      align: "center",
    });
    victoryText.setOrigin(0.5);

    // Crear texto de felicitaciones
    const congratsText = this.add.text(0, -70, "All levels completed", {
      fontSize: "24px",
      fill: "#ffffff",
      fontFamily: VT323_GENERIC,
      align: "center",
    });
    congratsText.setOrigin(0.5);

    // Calcular estadísticas finales desde levelData
    let totalZombiesKilledByPlayer = 0;
    let totalZombiesKilledByCollision = 0;
    let totalGameTime = 0;

    if (this.levelData.length > 0) {
      // Sumatoria de todos los zombies killed by player
      totalZombiesKilledByPlayer = this.levelData.reduce(
        (total, level) => total + (level.zombieDeathStats?.byPlayer || 0),
        0
      );

      // Sumatoria de todos los zombies killed by collision
      totalZombiesKilledByCollision = this.levelData.reduce(
        (total, level) => total + (level.zombieDeathStats?.byCollision || 0),
        0
      );

      // Tiempo total del último nivel completado
      const lastLevel = this.levelData[this.levelData.length - 1];
      totalGameTime = lastLevel.totalTime || 0;
    }

    const statsText = this.add.text(
      0,
      -10,
      `Zombies killed by player: ${totalZombiesKilledByPlayer}\nZombies killed by collision: ${totalZombiesKilledByCollision}\nTotal time: ${totalGameTime}s`,
      {
        fontSize: "22px",
        fill: "#ffffff",
        fontFamily: VT323_GENERIC,
        align: "center",
      }
    );
    statsText.setOrigin(0.5);

    // Crear botón "Jugar de nuevo"
    const playAgainButton = this.add.rectangle(0, 140, 200, 50, 0x004400);
    playAgainButton.setStrokeStyle(2, 0x00ff00);
    playAgainButton.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(0, 140, "Play again", {
      fontSize: "22px",
      fill: "#ffffff",
      fontFamily: VT323_GENERIC,
      fontStyle: "bold",
    });
    buttonText.setOrigin(0.5);

    // Agregar elementos al contenedor
    this.levelCompletedUI.add([
      panel,
      victoryText,
      congratsText,
      statsText,
      playAgainButton,
      buttonText,
    ]);

    // Configurar evento del botón
    playAgainButton.on("pointerdown", () => {
      this.scene.restart();
    });

    // Efectos de hover para el botón
    playAgainButton.on("pointerover", () => {
      playAgainButton.setFillStyle(0x006600);
    });

    playAgainButton.on("pointerout", () => {
      playAgainButton.setFillStyle(0x004400);
    });

    // Hacer visible la UI
    this.levelCompletedUI.setVisible(true);
    this.levelCompletedBackground.setVisible(true);
    this.levelCompletedUI.setDepth(101);
    this.levelCompletedbackground.setDepth(100);

    // Pausar el juego
    this.physics.pause();
  }
}
