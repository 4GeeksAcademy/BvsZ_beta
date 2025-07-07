import { EventBus } from "../EventBus";

export class ZombieObject {
  constructor(scene, velocityY, health, damage) {
    this.scene = scene;
    this.velocityY = velocityY;
    this.health = health;
    this.damage = damage;
    this.zombies = scene.zombies;
  }

  createZombie(velocityY, healht, damage) {
    const cols = this.scene.gridCells.length;
    const colWidth = this.scene.sys.game.config.width / cols;

    // Obtener las columnas que tienen servidores
    const serverCols = this.scene.servers.map((server) =>
      server.getData("col")
    );

    if (serverCols.length === 0) {
      // Si no hay servidores, no crear zombies
      return null;
    }

    // Obtener las columnas que tienen menos zombies para mejor distribución (solo en columnas con servidores)
    const columnCounts = {};
    serverCols.forEach((col) => {
      columnCounts[col] = 0;
    });

    this.zombies.getChildren().forEach((zombie) => {
      const zombieCol = zombie.getData("col");
      if (zombieCol !== undefined && columnCounts.hasOwnProperty(zombieCol)) {
        columnCounts[zombieCol]++;
      }
    });

    // Encontrar la columna con menos zombies (solo entre las que tienen servidores)
    const minCount = Math.min(...Object.values(columnCounts));
    const availableCols = Object.keys(columnCounts)
      .filter((col) => columnCounts[col] === minCount)
      .map((col) => parseInt(col));

    const col = availableCols[Phaser.Math.Between(0, availableCols.length - 1)];
    const zombieX = col * colWidth + colWidth / 2;

    // Calcular Y position para evitar solapamiento
    const zombiesInCol = this.zombies
      .getChildren()
      .filter((z) => z.getData("col") === col);
    let zombieY = 600; // Posición inicial

    // Si hay zombies en esta columna, colocar el nuevo zombie más atrás
    if (zombiesInCol.length > 0) {
      const maxY = Math.max(...zombiesInCol.map((z) => z.y));
      zombieY = Math.max(600, maxY + 60); // Espaciado de 60 pixels entre zombies
    }

    const zombie = this.scene.physics.add
      .image(zombieX, zombieY, "zombie")
      .setDisplaySize(40, 40)
      .setCollideWorldBounds(true);
    zombie.body.setAllowGravity(false);
    zombie.setData("health", healht);
    zombie.setData("col", col);
    zombie.setData("damage", damage); // Daño que causa el zombie al colisionar
    this.zombies.add(zombie);
    zombie.setVelocityY(velocityY);

    // Crear barra de vida debajo del zombie
    const bar = this.scene.add.graphics();
    bar.setDepth(3);
    this.drawHealthBar(bar, zombie.getData("health"));
    bar.x = zombie.x - 20;
    bar.y = zombie.y + 25;
    zombie.healthBar = bar;

    // Hacer que la barra siga al zombie en cada frame
    zombie.update = () => {
      if (zombie.healthBar) {
        zombie.healthBar.x = zombie.x - 20;
        zombie.healthBar.y = zombie.y + 25;
      }
    };

    // Agregar a la lista de actualizables de la escena si existe
    if (!this.scene.zombieUpdatables) this.scene.zombieUpdatables = [];
    this.scene.zombieUpdatables.push(zombie);

    return zombie;
  }

  drawHealthBar(bar, health) {
    bar.clear();
    const percent = Phaser.Math.Clamp(health / this.health, 0, 1);
    // Barra verde (vida restante)
    bar.fillStyle(0x00ff00, 1);
    bar.fillRect(0, 0, 40 * percent, 5);
    // Barra roja (vida perdida)
    bar.fillStyle(0xff0000, 1);
    bar.fillRect(40 * percent, 0, 40 * (1 - percent), 5);
  }

  receiveDamage(scene, zombie, amount) {
    let health = Number(zombie.getData("health"));
    health -= amount;
    zombie.setData("health", health);
    // Actualizar barra de vida
    if (zombie.healthBar) {
      this.drawHealthBar(zombie.healthBar, health);
      this.scene.sound.play("zombieHit1");
      this.scene.effects.bloodEmitter(zombie, 0, -10, 10);
    }
    if (health <= 0) {
      this.destroyZombie(zombie);
      this.scene.sound.play("zombieDead1");
      this.scene.effects.bloodEmitter(zombie, 0, -10, 100);
    }
  }

  destroyZombie(zombie) {
    zombie.healthBar.destroy();
    zombie.healthBar = null;
    // Eliminar de la lista de actualizables
    if (this.scene.zombieUpdatables) {
      const idx = this.scene.zombieUpdatables.indexOf(zombie);
      if (idx !== -1) this.scene.zombieUpdatables.splice(idx, 1);
    }
    // Eliminar del grupo de zombies
    if (this.zombies && this.zombies.contains(zombie)) {
      this.zombies.remove(zombie, true, true);
    }
    // Destruir sprite
    if (zombie && zombie.destroy) {
      zombie.destroy();
    }

    // Emitir evento de zombie eliminado para actualizar stats
    EventBus.emit("zombie:killed");
  }
}
