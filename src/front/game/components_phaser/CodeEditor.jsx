import { useState } from 'react';
import InputClasses from './InputClasses';
import './CodeEditor.css';

export default function CodeEditor({ levels }) {
    const [selectedClass, setSelectedClass] = useState('');

    return (
        <div className="code-block">
            <code>
                <span className="tag">&lt;div</span> <span className="attr">class</span>=<span className="value">"container border"&gt;</span><br />
                &nbsp;&nbsp;<span className="tag">&lt;div</span> <span className="attr">class</span>=<span className="value">"row </span>
                <span className='code-input' >
                    <InputClasses
                        levels={levels}
                        onClassSelected={(clase) => setSelectedClass(clase)}
                    />
                </span>
                <span className="value">"&gt;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="tag">&lt;div</span> <span className="attr">class</span>=<span className="value">"col-2"&gt;</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;T<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="tag">&lt;/div&gt;</span><br />
                &nbsp;&nbsp;<span className="tag">&lt;/div&gt;</span><br />
                <span className="tag">&lt;/div&gt;</span>
            </code>
        </div>
    );
}
