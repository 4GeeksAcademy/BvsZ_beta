import { EventBus, LEVEL_NEXT } from "../EventBus";

import { FONT_VT323_COUNTDOWN } from "../config/fonts.js";

export function registerCountdownUI(scene) {
  scene.showCountdown = function (callback) {
    // Marcar que estamos en conteo regresivo
    scene.isCountingDown = true;

    // Pausar el juego durante el conteo
    scene.physics.pause();

    // Asegurarse de que cualquier zombie existente esté congelado
    if (scene.zombies) {
      scene.zombies.children.iterate((zombie) => {
        if (zombie && zombie.active) {
          zombie.setVelocity(0, 0);
        }
      });
    }

    const centerX = scene.sys.game.config.width / 2;
    const centerY = scene.sys.game.config.height / 2;

    // Crear fondo semitransparente
    scene.countdownOverlay = scene.add.rectangle(
      centerX,
      centerY,
      scene.sys.game.config.width,
      scene.sys.game.config.height,
      0x000000,
      0.5
    );

    // Crear texto del conteo
    scene.countdownText = scene.add.text(
      centerX,
      centerY,
      "3",
      FONT_VT323_COUNTDOWN
    );
    scene.countdownText.setOrigin(0.5);
    scene.countdownText.setDepth(100);
    scene.countdownOverlay.setDepth(99);

    // Animación de escala para el texto
    scene.tweens.add({
      targets: scene.countdownText,
      scale: { from: 0.5, to: 1.5 },
      duration: 800,
      ease: "Power2",
    });

    // Secuencia de conteo: 3, 2, 1, Deploy!
    scene.time.delayedCall(1000, () => {
      scene.countdownText.setText("2");
      scene.tweens.add({
        targets: scene.countdownText,
        scale: { from: 0.5, to: 1.5 },
        duration: 800,
        ease: "Power2",
      });

      scene.time.delayedCall(1000, () => {
        scene.countdownText.setText("1");
        scene.tweens.add({
          targets: scene.countdownText,
          scale: { from: 0.5, to: 1.5 },
          duration: 800,
          ease: "Power2",
        });

        scene.time.delayedCall(1000, () => {
          scene.countdownText.setText("Deploy!");
          scene.countdownText.setFill("#ffff00");
          scene.tweens.add({
            targets: scene.countdownText,
            scale: { from: 0.5, to: 2 },
            duration: 800,
            ease: "Power2",
            onComplete: () => {
              // Limpiar elementos de la UI del conteo
              if (scene.countdownText) {
                scene.countdownText.destroy();
                scene.countdownText = null;
              }
              if (scene.countdownOverlay) {
                scene.countdownOverlay.destroy();
                scene.countdownOverlay = null;
              }

              // Marcar que finalizó el conteo
              scene.isCountingDown = false;

              // Reanudar el juego
              scene.physics.resume();
              EventBus.emit(LEVEL_NEXT);

              // Ejecutar callback si se proporcionó
              if (callback && typeof callback === "function") {
                callback();
              }
            },
          });
        });
      });
    });
  };
}
