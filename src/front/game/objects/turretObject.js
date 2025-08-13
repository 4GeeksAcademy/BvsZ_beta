// Clase para crear y gestionar las torretas
export class TurretObject {
  constructor(scene, health, turretCount, turretColumns) {
    this.scene = scene;
    this.health = health;
    this.turretCount = turretCount;
    this.turretColumns = turretColumns; // Array de índices de columna, o null para automático
    this.turrets = [];
  }

  createTurrets() {
    const cols = this.scene.gridCells.length;
    const colWidth = this.scene.sys.game.config.width / cols;
    const turretY = 100;
    this.turrets = [];
    let columnsToUse = [];
    if (Array.isArray(this.turretColumns) && this.turretColumns.length > 0) {
      columnsToUse = this.turretColumns;
    } else {
      columnsToUse = Array.from({ length: this.turretCount }, (_, i) => i);
    }
    for (let idx = 0; idx < columnsToUse.length; idx++) {
      const colIndex = columnsToUse[idx] - 1;
      const x = colIndex * colWidth + colWidth / 2;
      const turret = this.scene.physics.add
        .image(x, turretY, "turret_vsc")
        .setDisplaySize(50, 50);
      turret.setImmovable(true);
      turret.setData("col", colIndex);
      turret.setData("health", this.health);
      // Crear barra de vida vertical a la derecha
      const bar = this.scene.add.graphics();
      bar.setDepth(3);
      this.drawHealthBar(bar, turret.getData("health"));
      bar.x = turret.x + 25;
      bar.y = turret.y - 25;
      turret.healthBar = bar;
      this.turrets.push(turret);
    }
    this.scene.turrets = this.turrets;
  }

  drawHealthBar(bar, health) {
    bar.clear();
    const percent = Phaser.Math.Clamp(health / this.health, 0, 1);
    // Barra verde (vida restante)
    bar.fillStyle(0x00ff00, 1);
    bar.fillRect(0, 48 * (1 - percent), 4, 48 * percent);
    // Barra roja (vida perdida)
    bar.fillStyle(0xff0000, 1);
    bar.fillRect(0, 0, 4, 48 * (1 - percent));
  }

  receiveDamage(scene, turret, amount) {
    let health = Number(turret.getData("health"));
    const damage = amount;
    health -= damage;
    turret.setData("health", health);
    // Actualizar barra de vida
    if (turret.healthBar) {
      this.drawHealthBar(turret.healthBar, health);
    }
    if (health <= 0) {
      this.destroyTurret(turret);
    }
  }

  destroyTurret(turret) {
    turret.healthBar.destroy();
    turret.destroy();
    this.turrets = this.turrets.filter((t) => t !== turret);
    this.scene.turrets = this.turrets;

    // Verificar si no quedan torretas y acelerar zombies
    if (this.turrets.length === 0) {
      this.accelerateZombiesWhenNoTurrets();
    }
  }

  // Método para acelerar zombies cuando no hay torretas
  accelerateZombiesWhenNoTurrets() {
    const speedBoostVelocity = -800;

    // Acelerar zombies existentes
    if (this.scene.zombies) {
      this.scene.zombies.children.iterate((zombie) => {
        if (zombie && zombie.active) {
          zombie.setVelocityY(speedBoostVelocity);
        }
      });
    }

    // Cambiar la velocidad base del zombie manager para zombies futuros
    if (this.scene.zombieManager) {
      this.scene.zombieManager.zombieVelocityY = speedBoostVelocity;
    }

    console.log("¡No quedan torretas! Los zombies ahora se mueven más rápido.");
  }

  // Método para disparar (placeholder, implementar lógica de disparo aquí)
  shoot(turret) {
    // Implementar lógica de disparo aquí
  }

  // Método para reorganizar torretas según clases de Bootstrap (justify-content y offset)
  reorganizeTurrets(cssClasses) {
    if (this.turrets.length === 0) return;

    const cols = this.scene.gridCells.length;
    const colWidth = this.scene.sys.game.config.width / cols;
    const turretY = 100;
    const turretCount = this.turrets.length;

    let newPositions = [];

    // Convertir string a array si es necesario
    const classes = Array.isArray(cssClasses)
      ? cssClasses
      : cssClasses.split(" ");

    // Buscar clases de offset
    const offsetClass = classes.find((cls) => cls.startsWith("offset-"));
    let offsetCols = 0;
    if (offsetClass) {
      const offsetMatch = offsetClass.match(/offset-(\d+)/);
      if (offsetMatch) {
        offsetCols = parseInt(offsetMatch[1]);
        // Asegurar que el offset no exceda el número de columnas
        offsetCols = Math.min(offsetCols, cols - turretCount);
      }
    }

    // Buscar clases de justify-content
    const justifyClass = classes.find((cls) =>
      cls.startsWith("justify-content-")
    );

    // PASO 1: Calcular posiciones base según justify-content (sin offset)
    let basePositions = [];

    switch (justifyClass) {
      case "justify-content-start":
        // Alinear torretas al inicio (columna 0)
        for (let i = 0; i < turretCount; i++) {
          basePositions.push(i);
        }
        break;

      case "justify-content-center":
        // Centrar torretas en el grid completo
        const centerStart = Math.floor((cols - turretCount) / 2);
        for (let i = 0; i < turretCount; i++) {
          basePositions.push(centerStart + i);
        }
        break;

      case "justify-content-end":
        // Alinear torretas al final
        const endStart = cols - turretCount;
        for (let i = 0; i < turretCount; i++) {
          basePositions.push(endStart + i);
        }
        break;

      default:
        // Si no hay clase de justify, usar start por defecto
        for (let i = 0; i < turretCount; i++) {
          basePositions.push(i);
        }
        break;
    }

    // PASO 2: Aplicar offset (suma) a las posiciones calculadas
    for (let i = 0; i < basePositions.length; i++) {
      const finalColIndex = Math.min(cols - 1, Math.max(0, basePositions[i] + offsetCols));
      const x = finalColIndex * colWidth + colWidth / 2;
      newPositions.push({ x, colIndex: finalColIndex });
    }

    // Aplicar nuevas posiciones a las torretas existentes con animación
    this.turrets.forEach((turret, index) => {
      if (newPositions[index]) {
        const targetX = newPositions[index].x;
        const newColIndex = newPositions[index].colIndex;

        // Solo animar si la posición realmente cambió
        if (Math.abs(turret.x - targetX) > 1) {
          // Animar la torreta hacia su nueva posición
          this.scene.tweens.add({
            targets: turret,
            x: targetX,
            duration: 300, // Duración de la animación en milisegundos// Tipo de easing con un poco de rebote para mayor fluidez
            onUpdate: () => {
              // Actualizar la posición de la barra de vida durante la animación
              if (turret.healthBar) {
                turret.healthBar.x = turret.x + 25;
              }
            },
            onComplete: () => {
              // Actualizar el índice de columna cuando la animación termine
              turret.setData("col", newColIndex);
            },
          });
        } else {
          // Si no hay cambio de posición, solo actualizar el índice de columna
          turret.setData("col", newColIndex);
        }
      }
    });
  }
}
