import {useId, useRef, useState, type ReactNode} from 'react';
import styles from './Unit6.module.css';

interface Tab {id: string; label: string}
export default function AccessibleTabs({label, tabs, children}: {
  label: string; tabs: readonly Tab[]; children: (id: string) => ReactNode;
}) {
  const prefix = useId();
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <div>
    <div role="tablist" aria-label={label} className={styles.tabs}>
      {tabs.map((tab, index) => <button key={tab.id} ref={(node) => {buttons.current[index] = node;}}
        type="button" role="tab" id={`${prefix}-tab-${tab.id}`} aria-selected={active === index}
        aria-controls={`${prefix}-panel-${tab.id}`} tabIndex={active === index ? 0 : -1}
        onClick={() => setActive(index)} onKeyDown={(event) => {
          let next: number;
          switch (event.key) {
            case 'ArrowRight': next = (index + 1) % tabs.length; break;
            case 'ArrowLeft': next = (index + tabs.length - 1) % tabs.length; break;
            case 'Home': next = 0; break;
            case 'End': next = tabs.length - 1; break;
            default: return;
          }
          event.preventDefault(); setActive(next); buttons.current[next]?.focus();
        }}>{tab.label}</button>)}
    </div>
    {tabs.map((tab, index) => <div key={tab.id} role="tabpanel" id={`${prefix}-panel-${tab.id}`}
      aria-labelledby={`${prefix}-tab-${tab.id}`} hidden={active !== index} tabIndex={0}>
      {active === index ? children(tab.id) : null}
    </div>)}
  </div>;
}
