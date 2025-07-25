// Utilidades para crear y configurar objetos del juego
import { GridObject } from "../objects/gridObject";
import { ServerObject } from "../objects/serverObject";
import { ZombieObject } from "../objects/zombieObject";
import { EffectsObjects } from "../objects/effectsObject";
import { TurretObject } from "../objects/turretObject";
import { BulletObject } from "../objects/bulletObject";

export function createGameObjects(scene, skipFirstZombie = false) {
  // Crear grid
  scene.grid = new GridObject(scene, scene.level.gridCols);
  scene.grid.createGrid();

  // Crear servidores
  scene.server = new ServerObject(
    scene,
    scene.level.serverHealth,
    scene.level.gridCols,
    scene.level.serverCols
  );
  scene.server.createServers();

  // Crear grupo de zombies
  scene.zombies = scene.physics.add.group();
  scene.zombies.clear(true, true);

  // Crear zombie manager
  scene.zombieManager = new ZombieObject(
    scene,
    scene.level.zombieVelocityY,
    scene.level.zombieHealth,
    scene.level.zombieDamage
  );

  // Crear el primer zombie solo si no se indica omitirlo
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

  // Crear torretas
  scene.turret = new TurretObject(
    scene,
    scene.level.turretHealth,
    scene.level.turretsCount,
    scene.level.turretsCols
  );
  scene.turret.createTurrets();

  // Crear bullet manager y efectos
  scene.bulletManager = new BulletObject(scene);
  scene.effects = new EffectsObjects(scene);
  scene.effects.resetEmitters();
}
