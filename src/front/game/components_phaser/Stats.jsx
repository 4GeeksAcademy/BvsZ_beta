import React, { useState, useEffect } from 'react';
import { EventBus } from '../EventBus';
import './Stats.css';

const Stats = () => {
    const [tiempoDeJuego, setTiempoDeJuego] = useState('00:00');
    const [zombiesMuertos, setZombiesMuertos] = useState(0);
    const [nivel, setNivel] = useState(1);
    const [gameStartTime, setGameStartTime] = useState(null);
    const [gameActive, setGameActive] = useState(false);

    // Formatear tiempo en formato mm:ss
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        let intervalId = null;

        // Escuchar eventos del juego
        const handleGameStart = () => {
            setGameStartTime(Date.now());
            setGameActive(true);
            setZombiesMuertos(0);
            setTiempoDeJuego('00:00');
        };

        const handleGameStop = () => {
            setGameActive(false);
            if (intervalId) {
                clearInterval(intervalId);
            }
        };

        const handleZombieKilled = () => {
            setZombiesMuertos(prev => prev + 1);
        };

        const handleLevelChange = (newLevel) => {
            setNivel(newLevel);
        };

        // Registrar event listeners
        EventBus.on('game:start', handleGameStart);
        EventBus.on('game:stop', handleGameStop);
        EventBus.on('zombie:killed', handleZombieKilled);
        EventBus.on('level:change', handleLevelChange);

        // Actualizar timer cada segundo cuando el juego está activo
        if (gameActive && gameStartTime) {
            intervalId = setInterval(() => {
                const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
                setTiempoDeJuego(formatTime(elapsed));
            }, 1000);
        }

        // Cleanup
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            EventBus.removeListener('game:start', handleGameStart);
            EventBus.removeListener('game:stop', handleGameStop);
            EventBus.removeListener('zombie:killed', handleZombieKilled);
            EventBus.removeListener('level:change', handleLevelChange);
        };
    }, [gameActive, gameStartTime]);

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
