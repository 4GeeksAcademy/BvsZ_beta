import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EventBus, LEVEL_CHANGE, REORGANIZE_TURRETS, INPUT_METHOD_CHANGE } from '../EventBus';
// levels se recibirá por props
import '../components_phaser/InputClasses.css';

/**
 * Componente de input con autocompletado de clases por nivel.
 * @param {number} level - El nivel actual del juego (0-indexed).
 */

const InputClasses = ({ level, levels }) => {
  const [inputValue, setInputValue] = useState('');
  const [accuracy, setAccuracy] = useState();
  const [lastSelected, setLastSelected] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const inputRef = useRef(null);
  const [currentLevel, setCurrentLevel] = useState(level || 0);
  const [classList, setClassList] = useState(levels && levels[level || 0]?.inputClasses ? levels[level || 0].inputClasses : []);

  // Estadísticas de typing para calcular la precisión
  const [typingStats, setTypingStats] = useState({
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    backspaces: 0,
  });

  // Calcular y emitir la precisión de typing
  useEffect(() => {
    const calculateAccuracy = () => {
      if (typingStats.totalKeystrokes === 0) return 100;

      // Calculamos la precisión basada en teclas correctas vs total (sin contar backspaces)
      const adjustedTotal = typingStats.totalKeystrokes - typingStats.backspaces;
      if (adjustedTotal <= 0) return 100;

      const accuracy = (typingStats.correctKeystrokes / adjustedTotal) * 100;
      return parseFloat(Math.min(Math.max(accuracy, 0), 100).toFixed(1)); // Limitamos entre 0-100%
    };

    // Emitir evento con la precisión actual para que LevelCompletedUI lo capture
    setAccuracy(calculateAccuracy());

    // Emitimos un evento personalizado para la precisión de escritura
    EventBus.emit('TYPING_ACCURACY_UPDATE', accuracy);
  }, [typingStats]);

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

    // Asegurarse de que el método de entrada es teclado cuando se usa este componente
    EventBus.emit(INPUT_METHOD_CHANGE, { method: 'keyboard' });

    EventBus.on(LEVEL_CHANGE, handleLevelChange);
    return () => {
      EventBus.removeListener(LEVEL_CHANGE, handleLevelChange);
    };
  }, [levels]);

  const handleChange = (e) => {
    const value = e.target.value;
    const prevValue = inputValue;
    setInputValue(value);

    // Actualizar estadísticas de typing
    const isBackspace = value.length < prevValue.length;
    const newChars = isBackspace ? 0 : (value.length - prevValue.length);

    // Si está escribiendo una clase correcta, consideramos las teclas como correctas
    const isCorrectTyping = classList.some(cls =>
      cls.toLowerCase().startsWith(value.toLowerCase())
    );

    setTypingStats(prev => ({
      totalKeystrokes: prev.totalKeystrokes + newChars,
      correctKeystrokes: prev.correctKeystrokes + (isCorrectTyping ? newChars : 0),
      backspaces: prev.backspaces + (isBackspace ? 1 : 0),
    }));

    if (value.length >= 3) {
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

    // Bonus de precisión por selección exitosa
    setTypingStats(prev => ({
      ...prev,
      correctKeystrokes: prev.correctKeystrokes,
    }));

    // Emitir evento para reorganizar torretas
    EventBus.emit(REORGANIZE_TURRETS, { justifyClass: suggestion });
  };

  return (
    <div className="input-classes-autocomplete">
      <input
        ref={inputRef}
        type="text"
        className="form-control"
        placeholder={lastSelected}
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
      <div className="typing-accuracy">
        Precisión: {accuracy}%
      </div>
    </div>
  );
};

InputClasses.propTypes = {
  level: PropTypes.number,
  levels: PropTypes.array.isRequired,
};

export default InputClasses;
