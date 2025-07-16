import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';
import Stats from './components_phaser/Stats';
import TerminalButtonGroup from './components_phaser/TerminalButtonGroup';
import InputClasses from './components_phaser/InputClasses';
import './game-container.css';

const PhaserGame = forwardRef(function PhaserGame({ currentActiveScene }, ref) {
    const game = useRef();

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    useLayoutEffect(() => {

        if (game.current === undefined) {
            game.current = StartGame("game-container");

            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            console.log("PhaserGame: Iniciando cleanup...");

            // Limpiar EventBus
            EventBus.removeAllListeners();

            // Destruir el juego de Phaser
            if (game.current) {
                console.log("PhaserGame: Destruyendo instancia de Phaser...");
                try {
                    // Parar todos los sonidos antes de destruir
                    if (game.current.sound) {
                        game.current.sound.stopAll();
                    }

                    // Destruir el juego
                    game.current.destroy(true);
                    game.current = undefined;
                    console.log("PhaserGame: Instancia de Phaser destruida correctamente");
                } catch (error) {
                    console.error("Error al destruir Phaser:", error);
                    game.current = undefined;
                }
            }

            // Limpiar la referencia
            if (ref && ref.current) {
                ref.current = null;
            }

            // Limpiar el contenedor DOM
            const container = document.getElementById("game-container");
            if (container) {
                container.innerHTML = "";
            }
        }
    }, [ref]);

    useEffect(() => {

        EventBus.on('current-scene-ready', (currentScene) => {

            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            ref.current.scene = currentScene;

        });

        return () => {

            EventBus.removeListener('current-scene-ready');

        }

    }, [currentActiveScene, ref])

    return (
        <div className='container'>
            <div className='row no-wrap'>
                <div className='col-9'>
                    <div id="game-container"></div>
                </div>
                <div className='col-3'>
                    <Stats />
                    <TerminalButtonGroup />
                    <InputClasses />
                </div>
            </div>
        </div>

    );

});

export default PhaserGame;
