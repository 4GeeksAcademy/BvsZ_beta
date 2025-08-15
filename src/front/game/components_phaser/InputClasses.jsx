import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EventBus, LEVEL_CHANGE, REORGANIZE_TURRETS, INPUT_METHOD_CHANGE, GAME_PAUSE, GAME_RESUME } from '../EventBus';
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
  const [isPaused, setIsPaused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState('');

  // Estadísticas de typing para calcular la precisión
  const [typingStats, setTypingStats] = useState({
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    backspaces: 0,
  });

  // Función para generar placeholder dinámico basado en las clases disponibles
  const generateDynamicPlaceholder = (classes) => {
    if (!classes || classes.length === 0) {
      return "No classes available for this level";
    }

    const maxClasses = Math.min(classes.length, 8); // Mostrar máximo 8 clases
    const selectedClasses = classes.slice(0, maxClasses);

    let placeholder = "Available classes (one per line):\n";
    placeholder += selectedClasses.join('\n');

    if (classes.length > maxClasses) {
      placeholder += '\n... and ' + (classes.length - maxClasses) + ' more';
    }

    return placeholder;
  };

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
    setLastSelected('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(0);
    setClassList(levels && levels[currentLevel]?.inputClasses ? levels[currentLevel].inputClasses : []);

    // Generar placeholder dinámico
    const newClassList = levels && levels[currentLevel]?.inputClasses ? levels[currentLevel].inputClasses : [];
    setDynamicPlaceholder(generateDynamicPlaceholder(newClassList));

    // Reset typing stats
    setTypingStats({
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      backspaces: 0,
    });
  }, [currentLevel, levels]);

  useEffect(() => {
    const handleLevelChange = (newLevel) => {
      // newLevel es 1-indexed
      const idx = Math.max(0, Number(newLevel) - 1);
      setCurrentLevel(idx);
      const newClassList = levels && levels[idx]?.inputClasses ? levels[idx].inputClasses : [];
      setClassList(newClassList);
      setDynamicPlaceholder(generateDynamicPlaceholder(newClassList));
      setInputValue('');
      setLastSelected('');
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestion(0);
      // Reset typing stats
      setTypingStats({
        totalKeystrokes: 0,
        correctKeystrokes: 0,
        backspaces: 0,
      });
    };

    const handleGamePause = () => {
      setIsPaused(true);
      setShowSuggestions(false); // Ocultar sugerencias cuando se pausa
    };

    const handleGameResume = () => {
      setIsPaused(false);
    };

    // Asegurarse de que el método de entrada es teclado cuando se usa este componente
    EventBus.emit(INPUT_METHOD_CHANGE, { method: 'keyboard' });

    EventBus.on(LEVEL_CHANGE, handleLevelChange);
    EventBus.on(GAME_PAUSE, handleGamePause);
    EventBus.on(GAME_RESUME, handleGameResume);

    return () => {
      EventBus.removeListener(LEVEL_CHANGE, handleLevelChange);
      EventBus.removeListener(GAME_PAUSE, handleGamePause);
      EventBus.removeListener(GAME_RESUME, handleGameResume);
    };
  }, [levels]);

  const handleChange = (e) => {
    if (isPaused) return; // No permitir cambios cuando está pausado

    const value = e.target.value;
    const prevValue = inputValue;
    setCursorPosition(e.target.selectionStart);
    setInputValue(value);

    // Actualizar estadísticas de typing
    const isBackspace = value.length < prevValue.length;
    const newChars = isBackspace ? 0 : (value.length - prevValue.length);

    // Obtener la línea y palabra actual donde está el cursor
    const lines = value.split('\n');
    const currentLineIndex = value.substring(0, e.target.selectionStart).split('\n').length - 1;
    const currentLine = lines[currentLineIndex] || '';

    // Extraer la palabra actual (sin espacios al principio)
    const trimmedLine = currentLine.trim();
    const words = trimmedLine.split(/\s+/);
    const currentWord = words[words.length - 1] || '';

    // Si está escribiendo una clase correcta, consideramos las teclas como correctas
    const isCorrectTyping = classList.some(cls =>
      cls.toLowerCase().startsWith(currentWord.toLowerCase())
    );

    setTypingStats(prev => ({
      totalKeystrokes: prev.totalKeystrokes + newChars,
      correctKeystrokes: prev.correctKeystrokes + (isCorrectTyping ? newChars : 0),
      backspaces: prev.backspaces + (isBackspace ? 1 : 0),
    }));

    // Filtrar sugerencias basadas en la palabra actual
    if (currentWord.length >= 1 && currentWord !== '') {
      // Obtener todas las clases ya utilizadas en todo el texto
      const allUsedClasses = value.split(/\s+/).filter(cls => cls.trim() !== '');

      const filtered = classList.filter((cls) => {
        return cls.toLowerCase().startsWith(currentWord.toLowerCase()) &&
          !allUsedClasses.includes(cls);
      });
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setActiveSuggestion(0);

      // Calcular posición de sugerencias cerca del cursor
      if (filtered.length > 0) {
        const textarea = e.target;
        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const currentLineNumber = lines.length - 1;
        const currentLineLength = lines[currentLineNumber].length;

        // Aproximar posición basada en línea y columna
        setSuggestionPosition({
          top: (currentLineNumber + 1) * 21 + 12, // altura de línea aprox + padding
          left: Math.min(currentLineLength * 8.5 + 12, 200) // ancho de caracter aprox + padding, max 200px
        });
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (isPaused) return; // No permitir teclas cuando está pausado

    if (e.key === 'Enter') {
      if (showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        selectSuggestion(suggestions[activeSuggestion]);
      } else {
        // Aplicar clases cuando el usuario presiona Enter para nueva línea
        setTimeout(() => {
          applyClasses();
        }, 10);
        // Permitir Enter para nueva línea en el textarea
        // No prevenir el comportamiento por defecto aquí
      }
      return;
    }

    if (e.key === 'Tab') {
      if (showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        selectSuggestion(suggestions[activeSuggestion]);
      }
      return;
    }

    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const selectSuggestion = (suggestion) => {
    if (isPaused) return; // No permitir selección cuando está pausado

    const textarea = inputRef.current;
    const cursorPos = textarea.selectionStart;
    const value = inputValue;

    // Encontrar el inicio de la palabra actual
    const beforeCursor = value.substring(0, cursorPos);
    const lines = beforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex];

    // Buscar el último espacio o el inicio de línea
    const lastSpaceIndex = currentLine.lastIndexOf(' ');
    const wordStart = lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;

    // Calcular posiciones absolutas
    const linesBeforeCurrent = lines.slice(0, currentLineIndex);
    const charsBeforeLine = linesBeforeCurrent.join('\n').length + (linesBeforeCurrent.length > 0 ? 1 : 0);
    const absoluteWordStart = charsBeforeLine + wordStart;

    // Reemplazar la palabra parcial con la sugerencia completa
    const newValue =
      value.substring(0, absoluteWordStart) +
      suggestion +
      '\n' + // Añadir nueva línea después de la sugerencia
      value.substring(cursorPos);

    setInputValue(newValue);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(0);

    // Posicionar cursor al inicio de la nueva línea
    setTimeout(() => {
      const newCursorPos = absoluteWordStart + suggestion.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();

      // Aplicar las clases inmediatamente después de seleccionar una sugerencia
      setTimeout(() => {
        const trimmedValue = newValue.trim();
        if (trimmedValue) {
          const classesArray = trimmedValue.split('\n').map(line => line.trim()).filter(line => line !== '');
          const classesString = classesArray.join(' ');
          setLastSelected(classesString);
          EventBus.emit(REORGANIZE_TURRETS, { justifyClass: classesString });
        }
      }, 10);
    }, 0);

    // Bonus de precisión por selección exitosa
    setTypingStats(prev => ({
      ...prev,
      correctKeystrokes: prev.correctKeystrokes + suggestion.length,
    }));
  };

  // Método para aplicar las clases cuando el usuario pierde el foco o cambia de línea
  const applyClasses = () => {
    if (isPaused) return; // No permitir aplicar clases cuando está pausado

    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      // Convertir las líneas múltiples a clases separadas por espacios
      const classesArray = trimmedValue.split('\n').map(line => line.trim()).filter(line => line !== '');
      const classesString = classesArray.join(' ');

      // Solo aplicar si ha cambiado
      if (classesString !== lastSelected) {
        setLastSelected(classesString);
        // Emitir evento para reorganizar torretas con todas las clases
        EventBus.emit(REORGANIZE_TURRETS, { justifyClass: classesString });
      }
    }
  };

  // Aplicar clases automáticamente cuando cambie el inputValue con un pequeño delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.trim()) {
        applyClasses();
      }
    }, 500); // Esperar 500ms después del último cambio

    return () => clearTimeout(timeoutId);
  }, [inputValue, isPaused, lastSelected]);

  const handleCursorPosition = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  return (
    <div className="input-classes-autocomplete">
      <textarea
        ref={inputRef}
        className="form-control"
        placeholder={inputValue.trim() === '' && lastSelected === '' ? dynamicPlaceholder : lastSelected}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={applyClasses}
        onSelect={handleCursorPosition}
        onClick={handleCursorPosition}
        onKeyUp={handleCursorPosition}
        autoComplete="off"
        disabled={classList.length === 0 || isPaused}
        rows={4}
        spellCheck={false}
      />
      {showSuggestions && suggestions.length > 0 && !isPaused && (
        <ul
          className="suggestions-list"
          style={{
            top: `${suggestionPosition.top}px`,
            left: `${suggestionPosition.left}px`
          }}
        >
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
      {/*       <div className="typing-accuracy">
        Precisión: {accuracy}%
      </div> */}
    </div>
  );
};

InputClasses.propTypes = {
  level: PropTypes.number,
  levels: PropTypes.array.isRequired,
};

export default InputClasses;
