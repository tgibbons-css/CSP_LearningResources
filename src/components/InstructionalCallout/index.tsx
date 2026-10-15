import type {ReactNode} from 'react';

type Tone = 'note' | 'tip' | 'important';
const labels: Record<Tone, string> = {note: 'Note', tip: 'Try this', important: 'Important'};

export default function InstructionalCallout({tone = 'note', title, children}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}) {
  return <aside className={`instructional-callout callout-${tone}`}>
    <p className="callout-title">{title ?? labels[tone]}</p>
    <div>{children}</div>
  </aside>;
}
