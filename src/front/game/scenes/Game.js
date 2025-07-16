import Phaser from "phaser";
import { GridObject } from "../objects/gridObject";
import { ServerObject } from "../objects/serverObject";
import { ZombieObject } from "../objects/zombieObject";
import { EffectsObjects } from "../objects/effectsObject";
import { TurretObject } from "../objects/turretObject";
import { BulletObject } from "../objects/bulletObject";
import {
  EventBus,
  GAME_START,
  GAME_STOP,
  GAME_CLEANUP,
  GAME_VICTORY,
  ZOMBIE_KILLED,
  LEVEL_CHANGE,
  REORGANIZE_TURRETS,
} from "../EventBus";
import { levels as levelsMouse } from "../config/levels-mouse";
import { levels as levelsKeyboard } from "../config/levels-keyboard";
import forceCleanup from "../utils/ForceCleanup";
import registerLevelCompletedUI from "../utils/LevelCompletedUI";
import { registerCountdownUI } from "../utils/CountdownUI";
import { initializeGameElements } from "../utils/initializeGameElements";

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

    // Variables para el conteo regresivo
    this.countdownOverlay = null;
    this.countdownText = null;
    this.isCountingDown = false;
  }

  create() {
    registerLevelCompletedUI(this);
    registerCountdownUI(this);

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
      forceCleanup(this);
    };
    EventBus.on(GAME_CLEANUP, this.gameCleanupHandler);

    // Determinar el método de input seleccionado desde el menú
    const inputMethod = this.registry.get("inputMethod") || "mouse";
    this.levels = inputMethod === "keyboard" ? levelsKeyboard : levelsMouse;

    this.level = this.levels[this.currentLevelIndex];

    // Emitir evento de nivel inicial
    EventBus.emit(LEVEL_CHANGE, this.currentLevelIndex + 1);

    this.cameras.main.setBackgroundColor("#1c1f2b");

    // Inicialización del juego sin crear zombies iniciales
    initializeGameElements(this, true); // true = omitir creación del primer zombie

    // Mostrar conteo regresivo antes de iniciar el nivel
    this.showCountdown(() => {
      // Crear el primer zombie después de que termina el conteo
      const firstZombie = this.zombieManager.createZombie(
        this.level.zombieVelocityY,
        this.level.zombieHealth,
        this.level.zombieDamage
      );
      // Incrementar contador si se creó exitosamente
      if (firstZombie) {
        this.zombiesSpawned++;
        // Emitir evento de inicio de juego
        EventBus.emit(GAME_START);
      }
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

    if (this.currentLevelIndex < this.levels.length - 1) {
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
      this.level = this.levels[this.currentLevelIndex];

      // Emitir evento de cambio de nivel
      EventBus.emit(LEVEL_CHANGE, this.currentLevelIndex + 1);

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

      // Mostrar conteo regresivo antes de iniciar el nuevo nivel
      this.showCountdown();
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
    forceCleanup(this);
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
}
