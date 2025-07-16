
import { GridObject } from "../objects/gridObject";
import { ServerObject } from "../objects/serverObject";
import { ZombieObject } from "../objects/zombieObject";
import { EffectsObjects } from "../objects/effectsObject";
import { TurretObject } from "../objects/turretObject";

export function initializeGameElements(scene, skipFirstZombie = false) {
  scene.physics.resume();

  scene.grid = new scene.GridObject(scene, scene.level.gridCols);
  scene.grid.createGrid();

  scene.server = new scene.ServerObject(
    scene,
    scene.level.serverHealth,
    scene.level.gridCols,
    scene.level.serverCols
  );
  scene.server.createServers();

  scene.zombies = scene.physics.add.group();
  scene.zombies.clear(true, true);

  scene.zombieManager = new scene.ZombieObject(
    scene,
    scene.level.zombieVelocityY,
    scene.level.zombieHealth,
    scene.level.zombieDamage
  );

  if (!skipFirstZombie) {
    const firstZombie = scene.zombieManager.createZombie(
      scene.level.zombieVelocityY,
      scene.level.zombieHealth,
      scene.level.zombieDamage
    );
    if (firstZombie) {
      scene.zombiesSpawned++;
    }
  }

  scene.turret = new scene.TurretObject(
    scene,
    scene.level.turretHealth,
    scene.level.turretsCount,
    scene.level.turretsCols
  );
  scene.turret.createTurrets();

  scene.bulletManager = new scene.BulletObject(scene);
  scene.effects = new scene.EffectsObjects(scene);
  scene.effects.resetEmitters();

  scene.EventBus.removeAllListeners(scene.REORGANIZE_TURRETS);

  scene.reorganizeTurretsHandler = (data) => {
    scene.turret.reorganizeTurrets(data.justifyClass);
  };
  scene.EventBus.on(scene.REORGANIZE_TURRETS, scene.reorganizeTurretsHandler);

  scene.bgMusic = scene.sound.add("closeEncounter4", {
    loop: true,
    volume: 0.8,
  });
  scene.bgMusic.play();

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
      scene.zombieManager.destroyZombie(zombie, false);
      scene.sound.play("zombieDead2");
    },
    null,
    scene
  );

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
      scene.zombieManager.destroyZombie(zombie, false);
      scene.sound.play("zombieDead2");
    },
    null,
    scene
  );

  scene.time.addEvent({
    delay: 1000,
    callback: () => {
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

  scene.time.addEvent({
    delay: 500,
    callback: () => {
      if (
        scene.isCountingDown ||
        scene.zombies.getChildren().length >= scene.level.maxZombiesOnScreen ||
        scene.server.servers.length <= 0 ||
        scene.zombiesSpawned >= scene.level.zombiesPerLevel ||
        scene.levelCompleted
      ) {
        return;
      }
      const newZombie = scene.zombieManager.createZombie(
        scene.level.zombieVelocityY,
        scene.level.zombieHealth,
        scene.level.zombieDamage
      );
      if (newZombie) {
        scene.zombiesSpawned++;
      } else {
        console.log("No se puede crear zombie: no hay servidores disponibles");
      }
    },
    loop: true,
  });
}
