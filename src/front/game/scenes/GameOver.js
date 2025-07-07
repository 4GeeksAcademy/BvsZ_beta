import { EventBus } from "../EventBus";
import { Scene } from "phaser";

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
      .text(centerX, centerY - 120, "Game Over", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.add
      .text(centerX, centerY - 40, "All servers was destroy", {
        fontFamily: "Arial",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Mostrar estadísticas finales
    this.add
      .text(centerX, centerY + 10, "FINALS STATS", {
        fontFamily: "Arial Black",
        fontSize: 20,
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.add
      .text(
        centerX,
        centerY + 45,
        `⏱️ Tiempo de juego: ${this.finalStats.gameTime}`,
        {
          fontFamily: "Arial",
          fontSize: 18,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(100);

    this.add
      .text(
        centerX,
        centerY + 75,
        `🧟‍♂️ Zombies destroy: ${this.finalStats.zombiesKilled}`,
        {
          fontFamily: "Arial",
          fontSize: 18,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(100);

    this.add
      .text(
        centerX,
        centerY + 115,
        "Presiona cualquier tecla para volver al menú",
        {
          fontFamily: "Arial",
          fontSize: 16,
          color: "#cccccc",
          align: "center",
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
