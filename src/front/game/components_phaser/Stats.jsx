import React, { useState, useEffect } from 'react';
import {
    EventBus,
    GAME_START,
    GAME_STOP,
    ZOMBIE_KILLED,
    LEVEL_CHANGE,
    GAME_TIME_REQUEST,
    GAME_TIME_RESPONSE,
    LEVEL_COMPLETED,
    LEVEL_NEXT,
    GAME_PAUSE,
    GAME_RESUME
} from '../EventBus';
import './Stats.css';

const Stats = () => {
    const [zombiesMuertos, setZombiesMuertos] = useState(0);
    const [nivel, setNivel] = useState(1);
    const [gameStartTime, setGameStartTime] = useState(null);
    const [gameActive, setGameActive] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [pausedTime, setPausedTime] = useState(null);
    const [gamePaused, setGamePaused] = useState(false);

    // Función para manejar el clic en el botón de pausa/reanudar
    const handlePauseButtonClick = () => {
        if (gamePaused) {
            EventBus.emit(GAME_RESUME);
        } else {
            EventBus.emit(GAME_PAUSE);
        }
    };

    useEffect(() => {
        let intervalId = null;

        // Escuchar eventos del juego
        const handleGameStart = () => {
            setGameStartTime(Date.now());
            setGameActive(true);
            setZombiesMuertos(0);
            setElapsedSeconds(0);
            setIsPaused(false);
            setPausedTime(null);
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

        // Handler para pausar el tiempo al completar un nivel
        const handleLevelCompleted = () => {
            setIsPaused(true);
            setPausedTime(Date.now());
        };

        // Handler para reanudar el tiempo al iniciar el siguiente nivel
        const handleLevelNext = () => {
            if (isPaused && pausedTime) {
                // Ajustar el tiempo de inicio para compensar el tiempo pausado
                const pausedDuration = Date.now() - pausedTime;
                setGameStartTime(prev => prev + pausedDuration);
                setIsPaused(false);
                setPausedTime(null);
            }
        };

        // Handler para responder a solicitudes de tiempo
        const handleTimeRequest = () => {
            // Enviar el tiempo actual de juego como respuesta
            EventBus.emit(GAME_TIME_RESPONSE, {
                seconds: elapsedSeconds
            });
        };

        // Handlers para pausar y reanudar el juego
        const handleGamePause = () => {
            setIsPaused(true);
            setPausedTime(Date.now());
            setGamePaused(true);
        };

        const handleGameResume = () => {
            if (isPaused && pausedTime) {
                // Ajustar el tiempo de inicio para compensar el tiempo pausado
                const pausedDuration = Date.now() - pausedTime;
                setGameStartTime(prev => prev + pausedDuration);
                setIsPaused(false);
                setPausedTime(null);
                setGamePaused(false);
            }
        };



        // Registrar event listeners
        EventBus.on(GAME_START, handleGameStart);
        EventBus.on(GAME_STOP, handleGameStop);
        EventBus.on(ZOMBIE_KILLED, handleZombieKilled);
        EventBus.on(LEVEL_CHANGE, handleLevelChange);
        EventBus.on(LEVEL_COMPLETED, handleLevelCompleted);
        EventBus.on(LEVEL_NEXT, handleLevelNext);
        EventBus.on(GAME_TIME_REQUEST, handleTimeRequest);
        EventBus.on(GAME_PAUSE, handleGamePause);
        EventBus.on(GAME_RESUME, handleGameResume);

        // Actualizar timer cada segundo cuando el juego está activo
        if (gameActive && gameStartTime && !isPaused) {
            intervalId = setInterval(() => {
                const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
                setElapsedSeconds(elapsed);
            }, 1000);
        }

        // Cleanup
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            EventBus.removeListener(GAME_START, handleGameStart);
            EventBus.removeListener(GAME_STOP, handleGameStop);
            EventBus.removeListener(ZOMBIE_KILLED, handleZombieKilled);
            EventBus.removeListener(LEVEL_CHANGE, handleLevelChange);
            EventBus.removeListener(LEVEL_COMPLETED, handleLevelCompleted);
            EventBus.removeListener(LEVEL_NEXT, handleLevelNext);
            EventBus.removeListener(GAME_TIME_REQUEST, handleTimeRequest);
            EventBus.removeListener(GAME_PAUSE, handleGamePause);
            EventBus.removeListener(GAME_RESUME, handleGameResume);
        };
    }, [gameActive, gameStartTime, elapsedSeconds, isPaused, pausedTime, gamePaused]);

    return (
        <div className="stats-pixelart d-flex row container m-0">
            <div className="stat-row col m-0 p-0">
                <span className="stat-label">⏱️</span>
                <span className="stat-value">{elapsedSeconds}s</span>

                <button
                    className="pause-button ml-2"
                    onClick={handlePauseButtonClick}
                    style={{ cursor: 'pointer', marginLeft: '8px', border: 'none', background: 'none' }}
                >
                    {gamePaused ? '▶️' : '⏸️'}
                </button>

            </div>
            <div className="stat-row col m-0 p-0">
                <span className="stat-label">🧟‍♂️</span>
                <span className="stat-value">{zombiesMuertos}</span>
                <span className="stat-label">⭐</span>
                <span className="stat-value">{nivel}</span>
            </div>
        </div>
    );
};

export default Stats;
