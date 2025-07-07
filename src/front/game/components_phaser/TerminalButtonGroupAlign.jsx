import React, { useState, useEffect } from 'react';
import TerminalButton from './TerminalButton';
import { EventBus } from '../EventBus';
import './TerminalButtonGroup.css';

const TerminalButtonGroupAlign = () => {
    const [selectedAlign, setSelectedAlign] = useState('');
    const [gameActive, setGameActive] = useState(false);

    useEffect(() => {
        const handleGameStart = () => {
            setGameActive(true);
        };

        const handleGameStop = () => {
            setGameActive(false);
        };

        EventBus.on('game:start', handleGameStart);
        EventBus.on('game:stop', handleGameStop);

        return () => {
            EventBus.removeListener('game:start', handleGameStart);
            EventBus.removeListener('game:stop', handleGameStop);
        };
    }, []);

    const handleAlignClick = (alignClass) => {
        if (!gameActive) return;
        setSelectedAlign(alignClass);
        // Aquí puedes agregar la lógica para el align-items si es necesario
        // EventBus.emit('reorganize-turrets-align', { alignClass });
    };

    return (
        <div className='container d-inline mt-4'>
            <div className="col-auto">
                <TerminalButton 
                    label="align-items-start" 
                    onClick={() => handleAlignClick('align-items-start')}
                    isSelected={selectedAlign === 'align-items-start'}
                    disabled={!gameActive}
                />
            </div>
            <div className="col-auto">
                <TerminalButton 
                    label="align-items-center" 
                    onClick={() => handleAlignClick('align-items-center')}
                    isSelected={selectedAlign === 'align-items-center'}
                    disabled={!gameActive}
                />
            </div>
            <div className="col-auto">
                <TerminalButton 
                    label="align-items-end" 
                    onClick={() => handleAlignClick('align-items-end')}
                    isSelected={selectedAlign === 'align-items-end'}
                    disabled={!gameActive}
                />
            </div>
        </div>
    );
};

export default TerminalButtonGroupAlign;
