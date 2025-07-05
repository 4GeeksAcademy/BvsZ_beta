import React from 'react';
import TerminalButton from './TerminalButton';
import './TerminalButtonGroupJustify.css';

const TerminalButtonGroup = () => (
  <div>
    <div className="col">
      <TerminalButton label="justify-content-start" onClick={() => {}} />
    </div>
    <div className="col">
      <TerminalButton label="justify-content-center" onClick={() => {}} />
    </div>
    <div className="col">
      <TerminalButton label="justify-content-end" onClick={() => {}} />
    </div>
  </div>
);

export default TerminalButtonGroup;
