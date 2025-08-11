//componente para limpiar cuando se desmonta Phaser

function forceCleanup() {
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

    // Limpiar UI de countdown si existe
    if (this.countdownText) {
      this.countdownText.destroy();
      this.countdownText = null;
    }
    if (this.countdownOverlay) {
      this.countdownOverlay.destroy();
      this.countdownOverlay = null;
    }

    // Limpiar listeners
    this.cleanupEventListeners();

    // Pausar physics para evitar errores
    if (this.physics) {
      this.physics.pause();
    }
  }

  export default forceCleanup;