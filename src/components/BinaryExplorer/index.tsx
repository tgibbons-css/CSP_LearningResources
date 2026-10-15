import {useState} from 'react';

const weights = [8, 4, 2, 1] as const;

export default function BinaryExplorer() {
  const [bits, setBits] = useState([false, false, false, false]);
  const value = bits.reduce((total, enabled, index) => total + (enabled ? weights[index] : 0), 0);
  return <section className="activity-panel" aria-label="Four-bit binary explorer">
    <p>Turn each bit on or off. An active bit adds its place value to the total.</p>
    <div className="bit-controls">
      {weights.map((weight, index) => <button type="button" className="bit-toggle" key={weight}
        aria-label={`Bit with place value ${weight}`} aria-pressed={bits[index]}
        onClick={() => setBits((current) => current.map((bit, i) => i === index ? !bit : bit))}>
        <span className="bit-value" aria-hidden="true">{bits[index] ? '1' : '0'}</span>
        <span>Place value {weight}</span>
      </button>)}
    </div>
    <p role="status" aria-live="polite" aria-atomic="true" className="binary-result">
      Binary <strong>{bits.map(Number).join('')}</strong> = decimal <strong>{value}</strong>
    </p>
    <button type="button" className="button button--secondary" onClick={() => setBits([false, false, false, false])}>
      Reset bits
    </button>
    <p className="activity-note">Practice activity · Your work stays on this page and resets when you leave.</p>
  </section>;
}
