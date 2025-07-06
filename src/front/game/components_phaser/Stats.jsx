import React from 'react';
import './Stats.css';

const Stats = () => {
    // Valores predeterminados
    const tiempoDeJuego = '05:32'; // mm:ss
    const zombiesMuertos = 42;
    const nivel = 3;

    return (
        <div className="stats-pixelart d-flex row container m-0">
            <div className="stat-row col m-0 p-0">
                <span className="stat-label">⏱️</span>
                <span className="stat-value">{tiempoDeJuego}</span>
                <span className="stat-label">🧟‍♂️</span>
                <span className="stat-value">{zombiesMuertos}</span>
            </div>
            <div className="stat-row col m-0 p-0">
                <span className="stat-label">⭐</span>
                <span className="stat-value">{nivel}</span>
            </div>
        </div>
    );
};

export default Stats;
