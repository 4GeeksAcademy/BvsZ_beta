import React from 'react';
import './TerminalButton.css';

const TerminalButton = ({ label, onClick, isSelected = false }) => (
  <button
    className={`terminal-btn ${isSelected ? 'terminal-btn-selected' : ''}`}
    onClick={onClick}
  >
    {label}
  </button>
);

export default TerminalButton;
