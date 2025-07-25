import { EventBus, REORGANIZE_TURRETS } from "../EventBus";

import { setupGameCollisions, setupGameEvents } from "./GameCollisions";
import { createGameObjects } from "./GameObjects";

export function InitializeGameElements(scene, skipFirstZombie) {
  scene.physics.resume();

  // Crear todos los objetos del juego
  createGameObjects(scene, skipFirstZombie);

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

  // Configurar colisiones del juego
  setupGameCollisions(scene);

  // Configurar eventos automáticos (disparos y generación de zombies)
  setupGameEvents(scene);
}
