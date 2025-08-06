import React, { useState, useEffect } from 'react';
import TerminalButton from './TerminalButton';
import { EventBus, GAME_START, GAME_STOP, LEVEL_CHANGE, REORGANIZE_TURRETS } from '../EventBus';
// levels se recibirá por props
import './TerminalButtonGroup.css';


const TerminalButtonGroup = ({ levels }) => {
  const [selectedClasses, setSelectedClasses] = useState(['justify-content-center']); // Array para múltiples clases
  const [gameActive, setGameActive] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [classList, setClassList] = useState(levels && levels[0]?.inputClasses ? levels[0].inputClasses : []);

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
      setClassList(levels && levels[idx]?.inputClasses ? levels[idx].inputClasses : []);
      setSelectedClasses(['justify-content-center']); // Reset a clase por defecto
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

  const handleClassClick = (clickedClass) => {
    if (!gameActive) return;

    // Determinar el tipo de clase
    const isJustifyClass = clickedClass.startsWith('justify-content-');
    const isOffsetClass = clickedClass.startsWith('offset-');

    let newSelectedClasses = [...selectedClasses];

    if (isJustifyClass) {
      // Si la clase justify ya está seleccionada, la quitamos (toggle)
      if (newSelectedClasses.includes(clickedClass)) {
        newSelectedClasses = newSelectedClasses.filter(cls => cls !== clickedClass);
      } else {
        // Remover cualquier clase justify anterior y añadir la nueva
        newSelectedClasses = newSelectedClasses.filter(cls => !cls.startsWith('justify-content-'));
        newSelectedClasses.push(clickedClass);
      }
    } else if (isOffsetClass) {
      // Si ya existe una clase offset, la reemplazamos; si no, la añadimos
      if (newSelectedClasses.some(cls => cls.startsWith('offset-'))) {
        if (newSelectedClasses.includes(clickedClass)) {
          // Si es la misma clase offset, la quitamos (toggle)
          newSelectedClasses = newSelectedClasses.filter(cls => cls !== clickedClass);
        } else {
          // Reemplazar la clase offset existente
          newSelectedClasses = newSelectedClasses.filter(cls => !cls.startsWith('offset-'));
          newSelectedClasses.push(clickedClass);
        }
      } else {
        // Añadir la primera clase offset
        newSelectedClasses.push(clickedClass);
      }
    }

    setSelectedClasses(newSelectedClasses);

    // Emitir evento para reorganizar torretas con todas las clases seleccionadas
    const classString = newSelectedClasses.join(' ');
    EventBus.emit(REORGANIZE_TURRETS, { justifyClass: classString });
  };

  return (
    <div className='container d-inline mt-4'>
      {/* Mostrar las clases seleccionadas actualmente */}
      {selectedClasses.length > 0 && (
        <div className="mt-2 text-muted medium">
          Clases activas: {selectedClasses.join(' ')}
        </div>
      )}
      {classList.map((cssClass) => (
        <div className="col-auto" key={cssClass}>
          <TerminalButton
            label={cssClass}
            onClick={() => handleClassClick(cssClass)}
            isSelected={selectedClasses.includes(cssClass)}
            disabled={!gameActive}
          />
        </div>
      ))}


    </div>
  );
};

export default TerminalButtonGroup;
