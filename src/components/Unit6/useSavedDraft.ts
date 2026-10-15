import {useEffect, useState} from 'react';

/** Read only after hydration; never overwrite a stored draft with the SSR defaults. */
export default function useSavedDraft<T>(key: string, initial: T, valid: (value: unknown) => value is T) {
  const [draft, setDraft] = useState(initial);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [storageMessage, setStorageMessage] = useState('Loading saved notes…');
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (valid(parsed)) setDraft(parsed);
        else throw new Error('Unrecognized draft');
      }
      setStorageMessage('Notes save automatically in this browser.');
    } catch {
      setStorageMessage('Saved notes could not be restored. You can still work and copy your summary.');
    }
    setReady(true);
  }, [key, valid]);
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(draft));
      setSaved(true);
    } catch {
      setSaved(false);
      setStorageMessage('Browser storage is unavailable. Keep this page open and copy your work before leaving.');
    }
  }, [draft, key, ready]);
  return {draft, setDraft, ready, saved, storageMessage};
}
