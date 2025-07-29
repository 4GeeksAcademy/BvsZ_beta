import {
  EventBus,
  GAME_TIME_REQUEST,
  GAME_TIME_RESPONSE,
  LEVEL_COMPLETED,
  GAME_STOP,
} from "../EventBus";

import {
  FONT_VT323_TITLE,
  FONT_VT323_STATS,
  FONT_VT323_TIME,
  FONT_VT323_BUTTON,
  FONT_VT323_TITLE_VICTORY,
  FONT_VT323_TEXT_VICTORY,
} from "../config/fonts.js";

export default function registerLevelCompletedUI(scene) {
  scene.createLevelCompletedUI = function () {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    EventBus.emit(LEVEL_COMPLETED);

    EventBus.once(GAME_TIME_RESPONSE, (timeData) => {
      const previousLevelsTime = this.levelData.reduce(
        (total, level) => total + (level.timeInSeconds || 0),
        0
      );
      const currentLevelTime = timeData.seconds - previousLevelsTime;

      const previousLevelsZombiesByPlayer = this.levelData.reduce(
        (total, level) => total + (level.zombieDeathStats?.byPlayer || 0),
        0
      );
      const currentLevelZombiesByPlayer =
        this.gameStats.zombiesKilled - previousLevelsZombiesByPlayer;

      this.levelData.push({
        level: this.currentLevelIndex + 1,
        timeInSeconds: currentLevelTime,
        zombieDeathStats: {
          byPlayer: this.currentLevelZombieDeaths.byPlayer,
          byCollision: this.currentLevelZombieDeaths.byCollision,
          byTrap: this.currentLevelZombieDeaths.byTrap,
        },
        bulletsFired: this.currentLevelBulletsFired,
        totalZombiesKilled: this.gameStats.zombiesKilled,
        totalTime: timeData.seconds,
      });

      console.log(
        "Nivel completado - currentLevelBulletsFired:",
        this.currentLevelBulletsFired
      );
      console.log("Nivel completado - Datos agregados:", this.levelData.at(-1));
      console.log("Array completo de niveles:", this.levelData);

      this.levelCompletedBackground = this.add.rectangle(
        centerX,
        centerY,
        this.sys.game.config.width,
        this.sys.game.config.height,
        0x000000,
        0.7
      );

      this.levelCompletedUI = this.add.container(centerX, centerY);

      const panel = this.add.rectangle(0, 0, 400, 300, 0x2a2a2a, 0.9);
      panel.setStrokeStyle(3, 0x00ff00);

      this.levelCompletedText = this.add.text(
        0,
        -80,
        `¡Level ${this.currentLevelIndex + 1} complete!`,
        FONT_VT323_TITLE
      );
      this.levelCompletedText.setOrigin(0.5);

      const statsText = this.add.text(
        0,
        -30,
        `Zombies killed by player: ${this.currentLevelZombieDeaths.byPlayer}\nZombies killed by collision: ${this.currentLevelZombieDeaths.byCollision}`,
        FONT_VT323_STATS
      );
      statsText.setOrigin(0.5);

      const timeText = this.add.text(
        0,
        10,
        `Time: ${currentLevelTime}s`,
        FONT_VT323_TIME
      );
      timeText.setOrigin(0.5);

      this.nextLevelButton = this.add.rectangle(0, 80, 200, 50, 0x00aa00);
      this.nextLevelButton.setStrokeStyle(2, 0x00ff00);
      this.nextLevelButton.setInteractive({ useHandCursor: true });

      const buttonText = this.add.text(0, 80, "Next Level", FONT_VT323_BUTTON);
      buttonText.setOrigin(0.5);

      this.levelCompletedUI.add([
        panel,
        this.levelCompletedText,
        statsText,
        timeText,
        this.nextLevelButton,
        buttonText,
      ]);

      this.nextLevelButton.on("pointerdown", () => {
        this.hideLevelCompletedUI();
        this.nextLevel();
      });

      this.nextLevelButton.on("pointerover", () => {
        this.nextLevelButton.setFillStyle(0x00cc00);
      });

      this.nextLevelButton.on("pointerout", () => {
        this.nextLevelButton.setFillStyle(0x00aa00);
      });

      this.levelCompletedUI.setVisible(true);
      this.levelCompletedBackground.setVisible(true);
      this.bgMusic?.pause();
      this.physics.pause();
    });

    EventBus.emit(GAME_TIME_REQUEST);
  };

  scene.hideLevelCompletedUI = function () {
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

    this.bgMusic?.resume();
    this.physics.resume();
  };

  // Crear UI de victoria (todos los niveles completados)
  scene.createVictoryUI = function () {
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
    const victoryText = this.add.text(
      0,
      -120,
      "Victory!",
      FONT_VT323_TITLE_VICTORY
    );
    victoryText.setOrigin(0.5);

    // Crear texto de felicitaciones
    const congratsText = this.add.text(
      0,
      -70,
      "All levels completed",
      FONT_VT323_TEXT_VICTORY
    );
    congratsText.setOrigin(0.5);

    // Calcular estadísticas finales desde levelData
    let totalZombiesKilledByPlayer = 0;
    let totalZombiesKilledByCollision = 0;
    let totalBulletsFired = 0;
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

      // Sumatoria de todas las balas disparadas
      totalBulletsFired = this.levelData.reduce(
        (total, level) => total + (level.bulletsFired || 0),
        0
      );

      // Tiempo total del último nivel completado
      const lastLevel = this.levelData[this.levelData.length - 1];
      totalGameTime = lastLevel.totalTime || 0;
    }

    const statsText = this.add.text(
      0,
      -10,
      `Zombies killed by player: ${totalZombiesKilledByPlayer}\nZombies killed by collision: ${totalZombiesKilledByCollision}\nBullets fired: ${totalBulletsFired}\nTotal time: ${totalGameTime}s`,
      FONT_VT323_STATS
    );
    statsText.setOrigin(0.5);

    // Crear botón "Jugar de nuevo"
    const playAgainButton = this.add.rectangle(0, 140, 200, 50, 0x004400);
    playAgainButton.setStrokeStyle(2, 0x00ff00);
    playAgainButton.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(0, 140, "Main Menu", FONT_VT323_BUTTON);
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
      this.scene.start("MainMenu");
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
    this.levelCompletedBackground.setDepth(100);

    // Pausar el juego
    this.physics.pause();
  };
}
