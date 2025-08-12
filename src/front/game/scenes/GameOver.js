import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import {
  FONT_VT323,
  FONT_VT323_TITLE,
  FONT_VT323_STATS,
  FONT_VT323_TEXT_VICTORY,
  FONT_VT323_BUTTON,
} from "../config/fonts";

// Importar las funciones para enviar estadísticas
import { postUserStatsMouse, postUserStatsKeyboard } from "../../utils/auth";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
    this.finalStats = {
      zombiesKilled: 0,
      gameTime: "00:00",
    };
    // Método de entrada actual, predeterminado: mouse
    this.currentInputMethod = "mouse";
    // Precisión de escritura para el modo teclado, valor por defecto
    this.typingAccuracy = 99.7;
  }

  // Función para enviar estadísticas al servidor (igual que en LevelCompletedUI)
  sendGameStats() {
    if (!this.levelData || this.levelData.length === 0) {
      console.log(
        "GameOver - No se encontraron niveles completados, no se enviarán estadísticas"
      );
      return;
    }

    try {
      // Obtener método de entrada desde el registro global de Phaser
      const inputMethod = this.registry.get("inputMethod");
      if (inputMethod) {
        this.currentInputMethod = inputMethod;
      }

      // Obtener precisión de escritura desde el registro global de Phaser
      const typingAccuracy = this.registry.get("typingAccuracy");
      if (typingAccuracy !== undefined && typingAccuracy !== null) {
        this.typingAccuracy = typingAccuracy;
      }

      // Extraer estadísticas finales del último nivel
      const lastLevel = this.levelData[this.levelData.length - 1];

      // Calcular totales
      const totalZombiesKilledByPlayer = this.levelData.reduce(
        (total, level) => total + (level.zombieDeathStats?.byPlayer || 0),
        0
      );

      const totalZombiesKilledByEnvironment = this.levelData.reduce(
        (total, level) =>
          total +
          (level.zombieDeathStats?.byCollision || 0) +
          (level.zombieDeathStats?.byTrap || 0),
        0
      );

      const totalBulletsFired = this.levelData.reduce(
        (total, level) => total + (level.bulletsFired || 0),
        0
      );

      const totalTime = lastLevel.totalTime || 0;
      const levelsCompleted = this.levelData.length;

      // Crear objeto de estadísticas
      const statsData = {
        zombies_killed_by_player: totalZombiesKilledByPlayer,
        zombies_killed_by_environment: totalZombiesKilledByEnvironment,
        total_play_time: totalTime,
        bullets_fired: totalBulletsFired,
        typing_accuracy: this.typingAccuracy,
        levels_completed: levelsCompleted,
      };

      // Enviar estadísticas según el método de entrada
      if (this.currentInputMethod === "keyboard") {
        postUserStatsKeyboard(statsData)
          .then((response) =>
            console.log(
              "Estadísticas de teclado enviadas desde GameOver:",
              response
            )
          )
          .catch((error) =>
            console.error(
              "Error al enviar estadísticas de teclado desde GameOver:",
              error
            )
          );
      } else {
        postUserStatsMouse(statsData)
          .then((response) =>
            console.log(
              "Estadísticas de mouse enviadas desde GameOver:",
              response
            )
          )
          .catch((error) =>
            console.error(
              "Error al enviar estadísticas de mouse desde GameOver:",
              error
            )
          );
      }
    } catch (error) {
      console.error("Error al enviar estadísticas desde GameOver:", error);
    }
  }

  create(data) {
    // Emitir evento de parar el juego cuando llegamos a GameOver
    EventBus.emit("game:stop");

    // Recibir datos de nivel para poder enviar estadísticas
    this.levelData = data && data.levelData ? data.levelData : [];

    // Enviar estadísticas al servidor solo si hay niveles completados
    // (El nivel actual en el que se perdió no cuenta como completado)
    if (this.levelData && this.levelData.length > 0) {
      console.log(
        `GameOver - Enviando estadísticas de ${this.levelData.length} niveles completados`
      );
      this.sendGameStats();
    } else {
      console.log(
        "GameOver - No hay niveles completados, no se enviarán estadísticas"
      );
    }

    // Recibir datos de estadísticas finales si se proporcionan
    if (data && data.stats) {
      this.finalStats = data.stats;
    }

    // Calcular estadísticas finales desde levelData si están disponibles
    if (data && data.levelData && data.levelData.length > 0) {
      // Sumatoria de todos los zombies killed by player
      const totalZombiesKilledByPlayer = data.levelData.reduce(
        (total, level) => total + (level.zombieDeathStats?.byPlayer || 0),
        0
      );

      // Sumatoria de todos los zombies killed by collision
      const totalZombiesKilledByCollision = data.levelData.reduce(
        (total, level) => total + (level.zombieDeathStats?.byCollision || 0),
        0
      );

      // Sumatoria de todas las balas disparadas
      const totalBulletsFired = data.levelData.reduce(
        (total, level) => total + (level.bulletsFired || 0),
        0
      );

      // Tiempo total del último nivel completado
      const lastLevel = data.levelData[data.levelData.length - 1];
      const totalGameTime = lastLevel.totalTime || 0;

      // Actualizar finalStats con los datos calculados
      this.finalStats = {
        zombiesKilled:
          totalZombiesKilledByPlayer + totalZombiesKilledByCollision,
        zombiesKilledByPlayer: totalZombiesKilledByPlayer,
        zombiesKilledByCollision: totalZombiesKilledByCollision,
        bulletsFired: totalBulletsFired,
        gameTime: `${Math.floor(totalGameTime / 60)}:${(totalGameTime % 60)
          .toString()
          .padStart(2, "0")}`,
        totalTimeSeconds: totalGameTime,
      };
    } else {
      // No hay niveles completados, las estadísticas mostradas serán por defecto (0)
      console.log(
        "GameOver - Mostrando estadísticas por defecto (no hay niveles completados)"
      );
    }

    // Obtener las dimensiones reales del juego
    const { width, height } = this.sys.game.config;
    const centerX = width / 2;
    const centerY = height / 2;

    this.cameras.main.setBackgroundColor(0x000000);

    // Ajustar la imagen de fondo al tamaño de la pantalla
    const backgroundImage = this.add.image(centerX, centerY, "background");
    backgroundImage.setAlpha(0.3);
    backgroundImage.setDisplaySize(width, height);

    this.add
      .text(centerX, centerY - 120, "GAME OVER", {
        ...FONT_VT323_TITLE,
        fontSize: "64px",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.add
      .text(centerX, centerY - 40, "ALL SERVERS WERE DESTROYED", {
        ...FONT_VT323,
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Mostrar estadísticas finales
    this.add
      .text(centerX, centerY + 10, "FINAL STATS", {
        ...FONT_VT323_STATS,
        fontSize: "20px",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.add
      .text(
        centerX,
        centerY + 45,
        `TIME PLAYED: ${this.finalStats.totalTimeSeconds}`,
        {
          ...FONT_VT323_STATS,
          fontSize: "18px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 1,
        }
      )
      .setOrigin(0.5)
      .setDepth(100);

    // Mostrar estadística de zombies eliminados por el jugador
    this.add
      .text(
        centerX,
        centerY + 75,
        `ZOMBIES KILLED BY PLAYER: ${
          this.finalStats.zombiesKilledByPlayer || this.finalStats.zombiesKilled
        }`,
        {
          ...FONT_VT323_STATS,
          fontSize: "18px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 1,
        }
      )
      .setOrigin(0.5)
      .setDepth(100);

    // Mostrar estadística de zombies eliminados por colisión (solo si está disponible)
    if (this.finalStats.zombiesKilledByCollision !== undefined) {
      this.add
        .text(
          centerX,
          centerY + 105,
          `ZOMBIES KILLED BY COLLISION: ${this.finalStats.zombiesKilledByCollision}`,
          {
            ...FONT_VT323_STATS,
            fontSize: "18px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 1,
          }
        )
        .setOrigin(0.5)
        .setDepth(100);
    }

    // Mostrar estadística de balas disparadas (solo si está disponible)
    if (this.finalStats.bulletsFired !== undefined) {
      this.add
        .text(
          centerX,
          centerY +
            (this.finalStats.zombiesKilledByCollision !== undefined
              ? 135
              : 105),
          `BULLETS FIRED: ${this.finalStats.bulletsFired}`,
          {
            ...FONT_VT323_STATS,
            fontSize: "18px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 1,
          }
        )
        .setOrigin(0.5)
        .setDepth(100);
    }

    this.add
      .text(
        centerX,
        centerY +
          (this.finalStats.bulletsFired !== undefined
            ? 175
            : this.finalStats.zombiesKilledByCollision !== undefined
            ? 145
            : 115),
        "PRESS ANY KEY TO RETURN TO MENU",
        {
          ...FONT_VT323_BUTTON,
          fontSize: "16px",
          color: "#cccccc",
        }
      )
      .setOrigin(0.5)
      .setDepth(100);

    // Agregar listener para volver al menú principal
    this.input.keyboard.on("keydown", () => {
      this.changeScene();
    });

    // También permitir click para volver al menú
    this.input.on("pointerdown", () => {
      this.changeScene();
    });

    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("MainMenu");
  }
}
