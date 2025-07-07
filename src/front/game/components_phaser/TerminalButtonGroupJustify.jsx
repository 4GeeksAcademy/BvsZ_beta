import React, { useState, useEffect } from 'react';
import TerminalButton from './TerminalButton';
import { EventBus } from '../EventBus';
import './TerminalButtonGroup.css';

const TerminalButtonGroupJustify = () => {
  const [selectedJustify, setSelectedJustify] = useState('justify-content-center');
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

  const handleJustifyClick = (justifyClass) => {
    if (!gameActive) return;
    setSelectedJustify(justifyClass);
    // Emitir evento para que el juego reorganice las torretas
    EventBus.emit('reorganize-turrets', { justifyClass });
  };

  return (
    <div className='container d-inline mt-4'>
      <div className="col-auto">
        <TerminalButton
          label="justify-content-start"
          onClick={() => handleJustifyClick('justify-content-start')}
          isSelected={selectedJustify === 'justify-content-start'}
          disabled={!gameActive}
        />
      </div>
      <div className="col-auto">
        <TerminalButton
          label="justify-content-center"
          onClick={() => handleJustifyClick('justify-content-center')}
          isSelected={selectedJustify === 'justify-content-center'}
          disabled={!gameActive}
        />
      </div>
      <div className="col-auto">
        <TerminalButton
          label="justify-content-end"
          onClick={() => handleJustifyClick('justify-content-end')}
          isSelected={selectedJustify === 'justify-content-end'}
          disabled={!gameActive}
        />
      </div>
    </div>
  );
};

export default TerminalButtonGroupJustify;
