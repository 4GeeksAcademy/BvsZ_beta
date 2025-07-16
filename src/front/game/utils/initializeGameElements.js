import { EventBus, REORGANIZE_TURRETS } from "../EventBus";

import { GridObject } from "../objects/gridObject";
import { ServerObject } from "../objects/serverObject";
import { ZombieObject } from "../objects/zombieObject";
import { EffectsObjects } from "../objects/effectsObject";
import { TurretObject } from "../objects/turretObject";
import { BulletObject } from "../objects/bulletObject";

export function initializeGameElements(scene, skipFirstZombie) {
  scene.physics.resume();

  scene.grid = new GridObject(scene, scene.level.gridCols);
  scene.grid.createGrid();

  scene.server = new ServerObject(
    scene,
    scene.level.serverHealth,
    scene.level.gridCols,
    scene.level.serverCols
  );
  scene.server.createServers();

  scene.zombies = scene.physics.add.group();

  // Limpiar cualquier zombie previo (por si quedan de sesiones anteriores)
  scene.zombies.clear(true, true);

  scene.zombieManager = new ZombieObject(
    scene,
    scene.level.zombieVelocityY,
    scene.level.zombieHealth,
    scene.level.zombieDamage,
    scene.level.zombieCols
  );

  // Crear el primer zombie solo si no se indica omitirlo
  if (!skipFirstZombie) {
    // Crear el primer zombie con los parámetros correctos
    const firstZombie = scene.zombieManager.createZombie(
      scene.level.zombieVelocityY,
      scene.level.zombieHealth,
      scene.level.zombieDamage
    );
    // Incrementar contador si se creó exitosamente
    if (firstZombie) {
      scene.zombiesSpawned++;
    }
  }

  scene.turret = new TurretObject(
    scene,
    scene.level.turretHealth,
    scene.level.turretsCount,
    scene.level.turretsCols
  );
  scene.turret.createTurrets();

  scene.bulletManager = new BulletObject(scene);
  scene.effects = new EffectsObjects(scene);
  scene.effects.resetEmitters();

  // Limpiar cualquier listener previo y configurar el nuevo
  EventBus.removeAllListeners(REORGANIZE_TURRETS);

  // Escuchar evento para reorganizar torretas
  scene.reorganizeTurretsHandler = (data) => {
    scene.turret.reorganizeTurrets(data.justifyClass);
  };
  EventBus.on(REORGANIZE_TURRETS, scene.reorganizeTurretsHandler);

  scene.bgMusic = scene.sound.add("closeEncounter4", {
    loop: true,
    volume: 0.8, // Ajusta el volumen entre 0 y 1
  });
  scene.bgMusic.play();

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
      }
    },
    loop: true,
  });
}
