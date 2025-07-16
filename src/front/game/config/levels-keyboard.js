// Archivo de configuración de niveles para el juego por medio de teclado
import { inputClasses } from "./input-classes";

export const levels = [
  {
    turretHealth: 50,
    turretsCount: 4,
    turretsCols: [5, 6, 7, 8],
    gridCols: 12,
    serverCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    zombieCols: [1, 2, 3, 4], // Columnas donde pueden aparecer zombies
    serverHealth: 50,
    zombieVelocityY: -40, //Negativo
    zombieHealth: 10,
    zombieDamage: 10,
    bulletVelocityY: 100,
    bulletDamage: 10,
    zombiesPerLevel: 10,
    maxZombiesOnScreen: 5,
    inputClasses: inputClasses[0],
  },
  {
    turretHealth: 50,
    turretsCount: 4,
    turretsCols: [5, 6, 7, 8],
    gridCols: 12,
    serverCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    zombieCols: [5, 6, 7, 8], // Columnas donde pueden aparecer zombies
    serverHealth: 50,
    zombieVelocityY: -40, //Negativo
    zombieHealth: 10,
    zombieDamage: 10,
    bulletVelocityY: 110,
    bulletDamage: 10,
    zombiesPerLevel: 1,
    maxZombiesOnScreen: 10,
    inputClasses: inputClasses[1],
  },
  {
    turretHealth: 50,
    turretsCount: 4,
    turretsCols: [5, 6, 7, 8],
    gridCols: 12,
    serverCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    zombieCols: [9, 10, 11, 12], // Columnas donde pueden aparecer zombies
    serverHealth: 50,
    zombieVelocityY: -80, //Negativo
    zombieHealth: 30,
    zombieDamage: 10,
    bulletVelocityY: 110,
    bulletDamage: 10,
    zombiesPerLevel: 5,
    maxZombiesOnScreen: 10,
    inputClasses: inputClasses[2],
  },
];
