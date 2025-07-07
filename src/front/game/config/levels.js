// Archivo de configuración de niveles para el juego
// Puedes agregar más niveles modificando este array

export const levels = [
  {
    turretHealth: 50,
    turretsCount: 4,
    turretsCols: [5, 6, 7, 8],
    gridCols: 12,
    serverCols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    serverHealth: 50,
    zombieVelocityY: -70, //Negativo
    zombieHealth: 20,
    zombieDamage: 10,
    bulletVelocityY: 100,
    bulletDamage: 10
    // Puedes agregar más parámetros aquí
  },
  // Ejemplo de otro nivel
  // {
  //   turretHealth: 120,
  //   gridCols: 10,
  //   turretCols: [1,2,3,4,5,6,7,8,9,10],
  //   serverHealth: 150,
  //   zombieVelocityY: 60,
  // },
];
