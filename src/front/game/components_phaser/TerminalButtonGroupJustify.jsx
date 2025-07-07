import React, { useState } from 'react';
import TerminalButton from './TerminalButton';
import { EventBus } from '../EventBus';
import './TerminalButtonGroup.css';

const TerminalButtonGroupJustify = () => {
  const [selectedJustify, setSelectedJustify] = useState('justify-content-center');

  const handleJustifyClick = (justifyClass) => {
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
        />
      </div>
      <div className="col-auto">
        <TerminalButton
          label="justify-content-center"
          onClick={() => handleJustifyClick('justify-content-center')}
          isSelected={selectedJustify === 'justify-content-center'}
        />
      </div>
      <div className="col-auto">
        <TerminalButton
          label="justify-content-end"
          onClick={() => handleJustifyClick('justify-content-end')}
          isSelected={selectedJustify === 'justify-content-end'}
        />
      </div>
    </div>
  );
};

export default TerminalButtonGroupJustify;
