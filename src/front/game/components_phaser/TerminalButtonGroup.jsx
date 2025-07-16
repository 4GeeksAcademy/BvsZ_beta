import React, { useState, useEffect } from 'react';
import TerminalButton from './TerminalButton';
import { EventBus, GAME_START, GAME_STOP, LEVEL_CHANGE, REORGANIZE_TURRETS } from '../EventBus';
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

    EventBus.on(GAME_START, handleGameStart);
    EventBus.on(GAME_STOP, handleGameStop);
    EventBus.on(LEVEL_CHANGE, handleLevelChange);

    return () => {
      EventBus.removeListener(GAME_START, handleGameStart);
      EventBus.removeListener(GAME_STOP, handleGameStop);
      EventBus.removeListener(LEVEL_CHANGE, handleLevelChange);
    };
  }, []);

  const handleJustifyClick = (justifyClass) => {
    if (!gameActive) return;
    setSelectedJustify(justifyClass);
    // Emitir evento para que el juego reorganice las torretas
    EventBus.emit(REORGANIZE_TURRETS, { justifyClass });
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
