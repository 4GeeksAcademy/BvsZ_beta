import React from 'react';
import './TerminalButton.css';

const TerminalButton = ({ label, onClick }) => (
  <button className="terminal-btn" onClick={onClick}>
    {label}
  </button>
);

export default TerminalButton;
