import { useState, useEffect } from 'react';
import InputClasses from './InputClasses';
import './CodeEditor.css';
import { EventBus, LEVEL_CHANGE } from '../EventBus';

export default function CodeEditor({ levels }) {
    const [selectedClass, setSelectedClass] = useState('');
    const [currentLevel, setCurrentLevel] = useState(0);
    const [turretsCount, setTurretsCount] = useState(levels && levels[0] ? levels[0].turretsCount : 2);
    
    useEffect(() => {
        // Escuchar cambios de nivel y actualizar la cantidad de torretas
        const handleLevelChange = (levelNumber) => {
            const levelIndex = levelNumber - 1;
            setCurrentLevel(levelIndex);
            if (levels && levels[levelIndex]) {
                setTurretsCount(levels[levelIndex].turretsCount);
            }
        };
        
        EventBus.on(LEVEL_CHANGE, handleLevelChange);
        
        return () => {
            EventBus.removeListener(LEVEL_CHANGE, handleLevelChange);
        };
    }, [levels]);
    
    // Renderiza las imágenes de torretas según turretsCount
    const renderTurrets = () => {
        const turrets = [];
        for (let i = 0; i < turretsCount; i++) {
            turrets.push(
                <img 
                    key={i} 
                    src="/assets/images/turret_vsc.png" 
                    alt={`Turret ${i+1}`}
                    className={`turret-img ${i < turretsCount - 1 ? 'turret-img--mr' : ''}`}
                />
            );
        }
        return turrets;
    };

    return (
        <div className="code-block">
            <code>
                <span className="tag">&lt;div</span> <span className="attr">class</span>=<span className="value">"container border"</span><span className="tag">&gt;</span><br />
                &nbsp;&nbsp;<span className="tag">&lt;div</span> <span className="attr">class</span>=<span className="value">"row </span>
                <span className='code-input' >
                    <InputClasses
                        levels={levels}
                        onClassSelected={(clase) => setSelectedClass(clase)}
                    />
                </span>
                <span className="value">"</span><span className="tag">&gt;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="tag">&lt;div</span> <span className="attr">class</span>=<span className="value">"col-2"&gt;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{renderTurrets()}<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="tag">&lt;/div&gt;</span><br />
                &nbsp;&nbsp;<span className="tag">&lt;/div&gt;</span><br />
                <span className="tag">&lt;/div&gt;</span>
            </code>
        </div>
    );
}
