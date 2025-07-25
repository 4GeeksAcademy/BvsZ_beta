// Utilidad para configurar colisiones del juego
export function setupGameCollisions(scene) {
  // --- COLISIÓN ZOMBIE-SERVER ---
  scene.physics.add.collider(
    scene.zombies,
    scene.server.servers,
    (server, zombie) => {
      scene.effects.bloodEmitter(zombie);
      scene.effects.sparkEmitter(server);
      scene.server.receiveDamage(
        scene,
        server,
        Number(zombie.getData("damage"))
      );
      scene.currentLevelZombieDeaths.byCollision++;
      scene.zombieManager.destroyZombie(zombie, false); // No contar como kill
      scene.sound.play("zombieDead2");
    },
    null,
    scene
  );

  // --- COLISIÓN ZOMBIE-TURRET ---
  scene.physics.add.collider(
    scene.zombies,
    scene.turret.turrets,
    (turret, zombie) => {
      scene.effects.bloodEmitter(zombie, 0, -15);
      scene.effects.explosionFireEmitter(turret);
      scene.turret.receiveDamage(
        scene,
        turret,
        Number(zombie.getData("damage"))
      );
      scene.currentLevelZombieDeaths.byCollision++;
      scene.zombieManager.destroyZombie(zombie, false); // No contar como kill
      scene.sound.play("zombieDead2");
    },
    null,
    scene
  );

  // --- COLISIÓN BALA-ZOMBIE ---
  scene.physics.add.overlap(
    scene.bulletManager.bullets,
    scene.zombies,
    (bullet, zombie) => {
      const damage = bullet.getData("damage");
      scene.zombieManager.receiveDamage(scene, zombie, damage);
      const emitter = bullet.getData("rocketEmitter");
      if (emitter) emitter.destroy();
      bullet.destroy();
    },
    null,
    scene
  );
}

// Utilidad para configurar eventos automáticos del juego
export function setupGameEvents(scene) {
  // --- DISPARO AUTOMÁTICO DE TORRETAS ---
  scene.time.addEvent({
    delay: 1000,
    callback: () => {
      // No disparar torretas durante el conteo regresivo
      if (scene.isCountingDown) {
        return;
      }

      scene.turret.turrets.forEach((turret) => {
        const turretCol = turret.getData("col");
        const zombiesInCol = scene.zombies
          .getChildren()
          .filter((zombie) => zombie.getData("col") === turretCol);
        if (zombiesInCol.length > 0) {
          scene.bulletManager.fireBullet(
            scene,
            turret,
            scene.level.bulletDamage,
            scene.level.bulletVelocityY
          );
        }
      });
    },
    loop: true,
  });

  // --- GENERACIÓN AUTOMÁTICA DE ZOMBIES ---
  scene.time.addEvent({
    delay: 500,
    callback: () => {
      // No generar zombies durante el conteo regresivo
      if (
        scene.isCountingDown || // Verificar si estamos en conteo regresivo
        scene.zombies.getChildren().length >= scene.level.maxZombiesOnScreen ||
        scene.server.servers.length <= 0 ||
        scene.zombiesSpawned >= scene.level.zombiesPerLevel ||
        scene.levelCompleted
      ) {
        return; // No crear zombies si estamos en conteo regresivo o se cumplen otras condiciones
      }

      const newZombie = scene.zombieManager.createZombie(
        scene.level.zombieVelocityY,
        scene.level.zombieHealth,
        scene.level.zombieDamage
      );
      // Si se pudo crear el zombie, incrementar contador
      if (newZombie) {
        scene.zombiesSpawned++;
      } else {
        console.log("No se puede crear zombie: no hay servidores disponibles");
        //AGREGAR GAME OVER 
      }
    },
    loop: true,
  });
}
