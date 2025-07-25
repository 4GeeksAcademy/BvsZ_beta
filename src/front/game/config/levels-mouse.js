// Archivo de configuración de niveles para el juego por medio de mouse
import { inputClasses } from "./input-classes";

export const levels = [
  {
    turretHealth: 50,
    turretsCount: 2,
    turretsCols: [ 6, 7],
    gridCols: 12,
    serverCols: [1, 2, 6, 7,  11, 12],
    serverHealth: 50,
    zombieVelocityY: -70, //Negativo
    zombieHealth: 20,
    zombieDamage: 10,
    bulletVelocityY: 100,
    bulletDamage: 10,
    zombiesPerLevel: 2,
    maxZombiesOnScreen: 5,
    inputClasses: inputClasses[0],
  },
  {
    turretHealth: 50,
    turretsCount: 4,
    turretsCols: [5, 6, 7, 8],
    gridCols: 12,
    serverCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    serverHealth: 50,
    zombieVelocityY: -80, //Negativo
    zombieHealth: 30,
    zombieDamage: 10,
    bulletVelocityY: 110,
    bulletDamage: 10,
    zombiesPerLevel: 1,
    maxZombiesOnScreen: 10,
    inputClasses: inputClasses[2],
  },
  {
    turretHealth: 50,
    turretsCount: 4,
    turretsCols: [5, 6, 7, 8],
    gridCols: 12,
    serverCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    serverHealth: 50,
    zombieVelocityY: -80, //Negativo
    zombieHealth: 30,
    zombieDamage: 10,
    bulletVelocityY: 110,
    bulletDamage: 10,
    zombiesPerLevel: 1,
    maxZombiesOnScreen: 10,
    inputClasses: inputClasses[2],
  },
];
