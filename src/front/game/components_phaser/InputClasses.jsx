import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EventBus, LEVEL_CHANGE, REORGANIZE_TURRETS } from '../EventBus';
// levels se recibirá por props
import '../components_phaser/InputClasses.css';

/**
 * Componente de input con autocompletado de clases por nivel.
 * @param {number} level - El nivel actual del juego (0-indexed).
 */

const InputClasses = ({ level, levels }) => {
  const [inputValue, setInputValue] = useState('');
  const [lastSelected, setLastSelected] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const inputRef = useRef(null);
  const [currentLevel, setCurrentLevel] = useState(level || 0);
  const [classList, setClassList] = useState(levels && levels[level || 0]?.inputClasses ? levels[level || 0].inputClasses : []);

  useEffect(() => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(0);
    setClassList(levels && levels[currentLevel]?.inputClasses ? levels[currentLevel].inputClasses : []);
  }, [currentLevel, levels]);

  useEffect(() => {
    const handleLevelChange = (newLevel) => {
      // newLevel es 1-indexed
      const idx = Math.max(0, Number(newLevel) - 1);
      setCurrentLevel(idx);
      setClassList(levels && levels[idx]?.inputClasses ? levels[idx].inputClasses : []);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestion(0);
    };
    EventBus.on(LEVEL_CHANGE, handleLevelChange);
    return () => {
      EventBus.removeListener(LEVEL_CHANGE, handleLevelChange);
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.length >= 4) {
      const filtered = classList.filter((cls) =>
        cls.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
      setActiveSuggestion(0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      setActiveSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        selectSuggestion(suggestions[activeSuggestion]);
      }
    } else if (e.key === 'Tab') {
      if (suggestions.length > 0) {
        e.preventDefault();
        selectSuggestion(suggestions[activeSuggestion]);
      }
    }
  };

  const selectSuggestion = (suggestion) => {
    setLastSelected(suggestion);
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(0);
    // Emitir evento para reorganizar torretas
    EventBus.emit(REORGANIZE_TURRETS, { justifyClass: suggestion });
  };

  return (
    <div className="input-classes-autocomplete">
      {lastSelected && (
        <div className="last-selected-class">
          Last:
          <span className="text-bootstrap"><strong>{lastSelected}</strong></span>
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        className="form-control"
        placeholder="Type a class..."
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        disabled={classList.length === 0}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, idx) => (
            <li
              key={suggestion}
              className={idx === activeSuggestion ? 'active' : ''}
              onMouseDown={() => selectSuggestion(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

InputClasses.propTypes = {
  level: PropTypes.number,
  levels: PropTypes.array.isRequired,
};

export default InputClasses;
