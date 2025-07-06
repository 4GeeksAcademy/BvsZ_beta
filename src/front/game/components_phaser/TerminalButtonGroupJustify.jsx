import React from 'react';
import TerminalButton from './TerminalButton';
import './TerminalButtonGroupJustify.css';

const TerminalButtonGroupJustify = () => (
  <div className='container d-inline mt-4'>
    <div className="col-auto">
      <TerminalButton label="justify-content-start" onClick={() => {}} />
    </div>
    <div className="col-auto">
      <TerminalButton label="justify-content-center" onClick={() => {}} />
    </div>
    <div className="col-auto">
      <TerminalButton label="justify-content-end" onClick={() => {}} />
    </div>
  </div>
);

export default TerminalButtonGroupJustify;
