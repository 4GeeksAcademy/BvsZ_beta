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
    zombieVelocityY: -80, //Negativo
    zombieHealth: 10,
    zombieDamage: 10,
    bulletVelocityY: 100,
    bulletDamage: 10,
    zombiesPerLevel: 30,
    maxZombiesOnScreen: 5,
    inputClasses: inputClasses[2],
  },
  {
    turretHealth: 50,
    turretsCount: 6,
    turretsCols: [ 1, 2, 3, 4, 5, 6],
    gridCols: 12,
    serverCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    serverHealth: 50,
    zombieVelocityY: -880, //Negativo
    zombieHealth: 10,
    zombieDamage: 100,
    bulletVelocityY: 100,
    bulletDamage: 1,
    zombiesPerLevel: 30,
    maxZombiesOnScreen: 5,
    inputClasses: inputClasses[2],
  },
  {
    turretHealth: 50,
    turretsCount: 4,
    turretsCols: [ 1, 2, 3, 4],
    gridCols: 12,
    serverCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    serverHealth: 50,
    zombieVelocityY: -40, //Negativo
    zombieHealth: 10,
    zombieDamage: 1,
    bulletVelocityY: 100,
    bulletDamage: 10,
    zombiesPerLevel: 1,
    maxZombiesOnScreen: 5,
    inputClasses: inputClasses[2],
  },
  {
    turretHealth: 50,
    turretsCount: 2,
    turretsCols: [ 1, 2],
    gridCols: 12,
    serverCols: [1, 2, 6, 7, 11, 12],
    serverHealth: 50,
    zombieVelocityY: -40, //Negativo
    zombieHealth: 10,
    zombieDamage: 1,
    bulletVelocityY: 100,
    bulletDamage: 10,
    zombiesPerLevel: 15,
    maxZombiesOnScreen: 5,
    inputClasses: inputClasses[2],
  },
];
