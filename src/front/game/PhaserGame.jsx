import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';
import TerminalButtonGroup from './components_phaser/TerminalButtonGroupJustify';
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

            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
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
            <div className='row align-items-start no-wrap'>
                <div className='col-8'>
                    <div id="game-container"></div>
                </div>
                <div className='col-4'>
                    <TerminalButtonGroup />
                </div>
            </div>
        </div>

    );

});

export default PhaserGame;
