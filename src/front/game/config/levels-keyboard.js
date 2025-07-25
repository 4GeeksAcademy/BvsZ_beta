// Archivo de configuración de niveles para el juego por medio de teclado
import { inputClasses } from "./input-classes";

export const levels = [
  {
    turretHealth: 50,
    turretsCount: 6,
    turretsCols: [ 1, 2, 3, 4, 5, 6],
    gridCols: 12,
    serverCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    serverHealth: 50,
    zombieVelocityY: -40, //Negativo
    zombieHealth: 100,
    zombieDamage: 10,
    bulletVelocityY: 100,
    bulletDamage: 10,
    zombiesPerLevel: 5,
    maxZombiesOnScreen: 5,
    inputClasses: inputClasses[0],
  },
  {
    turretHealth: 50,
    turretsCount: 2,
    turretsCols: [ 6, 7],
    gridCols: 12,
    serverCols: [1, 2, 6, 7, 11, 12],
    serverHealth: 50,
    zombieVelocityY: -40, //Negativo
    zombieHealth: 10,
    zombieDamage: 10,
    bulletVelocityY: 100,
    bulletDamage: 10,
    zombiesPerLevel: 30,
    maxZombiesOnScreen: 6,
    inputClasses: inputClasses[0],
  },
  {
    turretHealth: 50,
    turretsCount: 3,
    turretsCols: [ 6, 7, 8],
    gridCols: 12,
    serverCols: [1, 2, 6, 7, 11, 12],
    serverHealth: 50,
    zombieVelocityY: -40, //Negativo
    zombieHealth: 10,
    zombieDamage: 10,
    bulletVelocityY: 100,
    bulletDamage: 10,
    zombiesPerLevel: 50,
    maxZombiesOnScreen: 8,
    inputClasses: inputClasses[0],
  },
];
