import React from 'react';
import './TerminalButton.css';

const TerminalButton = ({ label, onClick, isSelected = false, disabled = false }) => (
  <button
    className={`terminal-btn ${isSelected ? 'terminal-btn-selected' : ''} ${disabled ? 'terminal-btn-disabled' : ''}`}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

export default TerminalButton;
