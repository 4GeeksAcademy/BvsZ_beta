import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import StartGame from './main';
import { EventBus, INPUT_METHOD_CHANGE } from './EventBus';
import Stats from './components_phaser/Stats';
import TerminalButtonGroup from './components_phaser/TerminalButtonGroup';
import InputClasses from './components_phaser/InputClasses';
import { levels as levelsMouse } from './config/levels-mouse';
import { levels as levelsKeyboard } from './config/levels-keyboard';
import './game-container.css';
import CodeEditor from './components_phaser/CodeEditor';

const PhaserGame = forwardRef(function PhaserGame({ currentActiveScene }, ref) {
    const game = useRef();
    const [inputMethod, setInputMethod] = useState('mouse'); // Por defecto mouse

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    useLayoutEffect(() => {

        if (game.current === undefined) {
            game.current = StartGame("game-container");

            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {

            // Limpiar EventBus
            EventBus.removeAllListeners();

            // Destruir el juego de Phaser
            if (game.current) {
                try {
                    // Parar todos los sonidos antes de destruir
                    if (game.current.sound) {
                        game.current.sound.stopAll();
                    }

                    // Destruir el juego
                    game.current.destroy(true);
                    game.current = undefined;
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
        // Escuchar cambios en el método de entrada
        EventBus.on(INPUT_METHOD_CHANGE, ({ method }) => {
            setInputMethod(method);
        });

        EventBus.on('current-scene-ready', (currentScene) => {
            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            ref.current.scene = currentScene;

            // Si es la escena del menú, leer el método de entrada guardado si existe
            if (currentScene && currentScene.scene.key === 'MainMenu') {
                const savedMethod = currentScene.registry.get('inputMethod');
                if (savedMethod) {
                    setInputMethod(savedMethod);
                }
            }
        });

        return () => {
            EventBus.removeListener('current-scene-ready');
            EventBus.removeListener(INPUT_METHOD_CHANGE);
        }

    }, [currentActiveScene, ref])

    return (
        <div className='container-fluid'>
            <div className='row'>
                {/* Game Container - Full width on small screens, 8 columns on large screens */}
                <div className='col-12 col-lg-8'>
                    <div id="game-container"></div>
                </div>

                {/* Stats and Input Components - Stack below on small screens, sidebar on large screens */}
                <div className='col-12 col-lg-4 mt-3 mt-lg-0'>
                    {/* Primera fila: Stats */}
                    <div className='mb-3'>
                        <Stats />
                    </div>

                    {/* Segunda fila: Input Method Component */}
                    <div>
                        {/* Renderizar el componente según el método de entrada seleccionado */}
                        {inputMethod === 'mouse' ? (
                            <TerminalButtonGroup levels={levelsMouse} />
                        ) : (
                            <CodeEditor levels={levelsKeyboard} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

});

export default PhaserGame;
