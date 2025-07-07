import Phaser from "phaser";
import { GridObject } from "../objects/gridObject";
import { ServerObject } from "../objects/serverObject";
import { ZombieObject } from "../objects/zombieObject";
import { EffectsObjects } from "../objects/effectsObject";
import { TurretObject } from "../objects/turretObject";
import { EventBus } from "../EventBus";
import { BulletObject } from "../objects/bulletObject";
import { levels } from "../config/levels";

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
  }

  create() {
    // Personalizar el cursor para toda la escena de juego
    this.input.setDefaultCursor("crosshair");

    // Inicializar estadísticas del juego
    this.gameStats.zombiesKilled = 0;
    this.gameStats.gameStartTime = Date.now();

    // Inicializar variables de nivel
    this.currentLevelIndex = 0;
    this.zombiesSpawned = 0;
    this.levelCompleted = false;

    // Emitir evento de inicio de juego
    EventBus.emit("game:start");

    // Escuchar eventos de zombies eliminados para actualizar estadísticas
    this.zombieKilledHandler = () => {
      this.gameStats.zombiesKilled++;
      this.checkLevelCompletion();
    };
    EventBus.on("zombie:killed", this.zombieKilledHandler);

    this.level = levels[this.currentLevelIndex];

    // Emitir evento de nivel inicial
    EventBus.emit("level:change", this.currentLevelIndex + 1);

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
    this.zombieManager.createZombie(
      this.level.zombieVelocityY,
      this.level.zombieHealth,
      this.level.zombieDamage
    );

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
    EventBus.removeAllListeners("reorganize-turrets");

    // Escuchar evento para reorganizar torretas
    this.reorganizeTurretsHandler = (data) => {
      this.turret.reorganizeTurrets(data.justifyClass);
    };
    EventBus.on("reorganize-turrets", this.reorganizeTurretsHandler);

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
        this.zombieManager.destroyZombie(zombie);
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
        this.zombieManager.destroyZombie(zombie);
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
            console.log(
              `Zombies spawned: ${this.zombiesSpawned}/${this.level.zombiesPerLevel}`
            );
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

    // Log solo si hay zombies problemáticos
    if (zombiesOutOfBounds > 0) {
      console.log(
        `Zombies fuera de pantalla: ${zombiesOutOfBounds}, Total zombies: ${this.zombies.children.size}`
      );
    }

    // Destruir zombies que salen de la pantalla
    this.zombies.children.iterate((zombie) => {
      if (zombie && zombie.active) {
        // Los zombies se mueven hacia arriba (velocidad Y negativa)
        // Si el zombie sale por arriba de la pantalla, destruirlo
        if (zombie.y < -50) {
          console.log(
            `Destruyendo zombie por arriba en Y: ${
              zombie.y
            }, Col: ${zombie.getData("col")}`
          );
          this.zombieManager.destroyZombie(zombie);
        }
        // Si el zombie sale por abajo de la pantalla (por si hay algún error), destruirlo
        else if (zombie.y > this.sys.game.config.height + 100) {
          console.log(
            `Destruyendo zombie por abajo en Y: ${
              zombie.y
            }, Col: ${zombie.getData("col")}`
          );
          this.zombieManager.destroyZombie(zombie);
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
    // Verificar si todos los zombies han sido spawneados y eliminados
    if (
      this.zombiesSpawned >= this.level.zombiesPerLevel &&
      this.zombies.getChildren().length === 0 &&
      !this.levelCompleted
    ) {
      this.levelCompleted = true;
      console.log(`¡Nivel ${this.currentLevelIndex + 1} completado!`);

      // Esperar un poco antes de cambiar al siguiente nivel
      this.time.delayedCall(2000, () => {
        this.nextLevel();
      });
    }
  }

  // Avanzar al siguiente nivel
  nextLevel() {
    if (this.currentLevelIndex < levels.length - 1) {
      this.currentLevelIndex++;
      this.zombiesSpawned = 0;
      this.levelCompleted = false;

      // Actualizar configuración del nivel
      this.level = levels[this.currentLevelIndex];

      // Emitir evento de cambio de nivel
      EventBus.emit("level:change", this.currentLevelIndex + 1);

      console.log(`Iniciando nivel ${this.currentLevelIndex + 1}`);

      // Recrear elementos del juego con nuevos parámetros
      this.recreateGameElements();
    } else {
      // Todos los niveles completados - victoria
      console.log("¡Todos los niveles completados! ¡Victoria!");
      EventBus.emit("game:victory");
    }
  }

  // Recrear elementos del juego para el nuevo nivel
  recreateGameElements() {
    // Limpiar zombies existentes
    this.zombies.clear(true, true);

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
    // Emitir evento de parar el juego
    EventBus.emit("game:stop");

    // Limpiar listeners de eventos cuando la escena se destruya
    if (this.reorganizeTurretsHandler) {
      EventBus.removeListener(
        "reorganize-turrets",
        this.reorganizeTurretsHandler
      );
      this.reorganizeTurretsHandler = null;
    }

    // Limpiar listener de zombies eliminados
    if (this.zombieKilledHandler) {
      EventBus.removeListener("zombie:killed", this.zombieKilledHandler);
      this.zombieKilledHandler = null;
    }

    // Detener música de fondo
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
  }
}
