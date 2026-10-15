import {useId, useState} from 'react';

export interface SelfCheckProps {
  question: string;
  options: readonly {id: string; text: string}[];
  correctAnswer: string;
  explanation: string;
}

/** Practice only: state is local, ephemeral, and never submitted. */
export default function SelfCheck({question, options, correctAnswer, explanation}: SelfCheckProps) {
  const id = useId();
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === correctAnswer;

  return <form className="activity-panel" onSubmit={(event) => {
    event.preventDefault();
    if (selected) setSubmitted(true);
  }}>
    <fieldset>
      <legend>{question}</legend>
      {options.map((option) => <label className="answer-option" key={option.id}>
        <input type="radio" name={id} value={option.id} checked={selected === option.id}
          onChange={() => {setSelected(option.id); setSubmitted(false);}} />
        <span>{option.text}</span>
      </label>)}
    </fieldset>
    <div className="activity-actions">
      <button className="button button--primary" type="submit" disabled={!selected}>Check answer</button>
      <button className="button button--secondary" type="button" onClick={() => {
        setSelected(''); setSubmitted(false);
      }}>Reset</button>
    </div>
    <div role="status" aria-live="polite" aria-atomic="true" className="activity-feedback">
      {submitted && <p><strong>{correct ? 'Correct.' : 'Not quite. Try again.'}</strong>{' '}{explanation}</p>}
    </div>
  </form>;
}
