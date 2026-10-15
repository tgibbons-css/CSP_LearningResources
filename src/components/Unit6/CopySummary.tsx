import {useId, useState} from 'react';
import styles from './Unit6.module.css';

export function markdownCell(value: string) {
  return value.trim().replace(/\\/g, '\\\\').replace(/\|/g, '\\|')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, '<br>') || '—';
}

export default function CopySummary({text, label}: {text: string; label: string}) {
  const id = useId();
  const [message, setMessage] = useState('');
  const [fallback, setFallback] = useState(false);
  return <div className={styles.export}>
    <button className="button button--primary" type="button" onClick={async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text);
        setMessage('Summary copied. Paste it into your class document or board.');
        setFallback(false);
      } catch {
        setFallback(true);
        setMessage('Clipboard access is unavailable. Select and copy the summary below.');
      }
    }}>{label}</button>
    <p role="status" aria-live="polite" className={styles.small}>{message}</p>
    <details open={fallback || undefined}>
      <summary>View Markdown summary / copy manually</summary>
      <label htmlFor={id}>Markdown summary</label>
      <textarea id={id} readOnly value={text} rows={10} onFocus={(event) => event.currentTarget.select()} />
    </details>
    <p className={styles.small}>Copying does not submit your work. Markdown may paste as plain text in Google Docs; keep the headings and table text or format them there.</p>
  </div>;
}
