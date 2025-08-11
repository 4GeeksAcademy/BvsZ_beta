import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import {
  FONT_VT323,
  FONT_VT323_TITLE,
  FONT_VT323_STATS,
  FONT_VT323_TEXT_VICTORY,
  FONT_VT323_BUTTON,
} from "../config/fonts";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
    this.finalStats = {
      zombiesKilled: 0,
      gameTime: "00:00",
    };
  }

  create(data) {
    // Emitir evento de parar el juego cuando llegamos a GameOver
    EventBus.emit("game:stop");

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
      console.log("GameOver - No se encontró levelData o está vacío");
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
