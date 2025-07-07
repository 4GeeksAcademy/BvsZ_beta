// Clase para crear y gestionar los "servers" que las torretas defienden
export class ServerObject {
  constructor(scene, health = 50, serverCount = 1, serverColumns = null) {
    this.scene = scene;
    this.health = health;
    this.serverCount = serverCount;
    this.serverColumns = serverColumns; // Array de índices de columna, o null para automático
    this.servers = [];
  }

  createServers() {
    if (!this.scene.gridCells || this.scene.gridCells.length === 0) return;
    this.servers = [];
    let columnsToUse = [];
    if (Array.isArray(this.serverColumns) && this.serverColumns.length > 0) {
      columnsToUse = this.serverColumns;
    } else {
      // Si no se especifican columnas, usar las primeras serverCount columnas
      columnsToUse = Array.from({ length: this.serverCount }, (_, i) => i);
    }
    for (let idx = 0; idx < columnsToUse.length; idx++) {
      const colIndex = columnsToUse[idx] - 1;
      if (!this.scene.gridCells[colIndex]) continue;
      const colData = this.scene.gridCells[colIndex];
      const serverY = 40;
      const server = this.scene.physics.add.image(colData.x, serverY, "server");
      server.setDisplaySize(55, 55);
      server.body.setSize(55, 55);
      server.body.setImmovable(true);
      server.body.setAllowGravity(false);
      server.setData("health", this.health);
      server.setDepth(2);
      server.setData("col", colIndex);
      // Crear barra de vida
      const bar = this.scene.add.graphics();
      bar.setDepth(3);
      this.drawHealthBar(bar, server.getData("health"));
      bar.x = server.x - 27;
      bar.y = server.y - 37;
      server.healthBar = bar;
      this.servers.push(server);
    }
    this.scene.servers = this.servers;
  }

  drawHealthBar(bar, health) {
    bar.clear();
    const percent = Phaser.Math.Clamp(health / this.health, 0, 1);
    bar.fillStyle(0x00ff00, 1);
    bar.fillRect(0, 0, 54 * percent, 4);
    bar.fillStyle(0xff0000, 1);
    bar.fillRect(54 * percent, 0, 54 * (1 - percent), 4);
  }

  receiveDamage(scene, server, amount) {
    let health = Number(server.getData("health"));
    const damage = amount;
    health -= damage;
    server.setData("health", health);
    this.scene.sound.play("hurt1");
    // Actualizar barra de vida
    if (server.healthBar) {
      this.drawHealthBar(server.healthBar, health);
    }
    if (health <= 0) {
      this.destroyServer(server);
    }
  }

  destroyServer(server) {
    server.healthBar.destroy();
    server.destroy();
    this.servers = this.servers.filter((s) => s !== server);
    this.scene.servers = this.servers;

    // Verificar si todos los servidores han sido destruidos
    if (this.servers.length === 0) {
      // Reproducir sonido dramático
      this.scene.sound.play("hurt1");

      // Detener la música de fondo si existe
      if (this.scene.bgMusic) {
        this.scene.bgMusic.stop();
      }

      // Pasar a la pantalla de Game Over con un pequeño delay para el efecto dramático
      this.scene.time.delayedCall(1000, () => {
        // Calcular tiempo final de juego
        const gameTime = this.formatGameTime();
        
        // Preparar estadísticas finales
        const finalStats = {
          zombiesKilled: this.scene.gameStats ? this.scene.gameStats.zombiesKilled : 0,
          gameTime: gameTime
        };
        
        this.scene.scene.start("GameOver", { stats: finalStats });
      });
    }
  }

  // Función para formatear el tiempo de juego
  formatGameTime() {
    if (!this.scene.gameStats || !this.scene.gameStats.gameStartTime) {
      return '00:00';
    }
    
    const elapsed = Math.floor((Date.now() - this.scene.gameStats.gameStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
