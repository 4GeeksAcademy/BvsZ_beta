import React from 'react';
import TerminalButton from './TerminalButton';
import './TerminalButtonGroup.css';

const TerminalButtonGroupAlign = () => (
    <div className='container d-inline mt-4'>
        <div className="col-auto">
            <TerminalButton label="align-items-start" onClick={() => { }} />
        </div>
        <div className="col-auto">
            <TerminalButton label="align-items-center" onClick={() => { }} />
        </div>
        <div className="col-auto">
            <TerminalButton label="align-items-end" onClick={() => { }} />
        </div>
    </div>
);

export default TerminalButtonGroupAlign;
