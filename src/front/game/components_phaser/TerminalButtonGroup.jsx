import React, { useState, useEffect } from 'react';
import TerminalButton from './TerminalButton';
import { EventBus } from '../EventBus';
import { levels } from '../config/levels';
import './TerminalButtonGroup.css';


const TerminalButtonGroup = () => {
  const [selectedJustify, setSelectedJustify] = useState('justify-content-center');
  const [gameActive, setGameActive] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [classList, setClassList] = useState(levels[0]?.inputClasses || []);

  useEffect(() => {
    const handleGameStart = () => {
      setGameActive(true);
    };
    const handleGameStop = () => {
      setGameActive(false);
    };
    const handleLevelChange = (newLevel) => {
      // newLevel es 1-indexed
      const idx = Math.max(0, Number(newLevel) - 1);
      setLevelIndex(idx);
      setClassList(levels[idx]?.inputClasses || []);
      setSelectedJustify('justify-content-center');
    };

    EventBus.on('game:start', handleGameStart);
    EventBus.on('game:stop', handleGameStop);
    EventBus.on('level:change', handleLevelChange);

    return () => {
      EventBus.removeListener('game:start', handleGameStart);
      EventBus.removeListener('game:stop', handleGameStop);
      EventBus.removeListener('level:change', handleLevelChange);
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
      {classList.map((justifyClass) => (
        <div className="col-auto" key={justifyClass}>
          <TerminalButton
            label={justifyClass}
            onClick={() => handleJustifyClick(justifyClass)}
            isSelected={selectedJustify === justifyClass}
            disabled={!gameActive}
          />
        </div>
      ))}
    </div>
  );
};

export default TerminalButtonGroup;
