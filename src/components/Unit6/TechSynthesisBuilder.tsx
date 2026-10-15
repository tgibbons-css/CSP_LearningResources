import {useId} from 'react';
import AccessibleTabs from './AccessibleTabs';
import CopySummary, {markdownCell} from './CopySummary';
import useSavedDraft from './useSavedDraft';
import styles from './Unit6.module.css';

const tracks = [
  {id: 'fiveVs', label: 'The 5 V’s of Big Data', guidance: 'Volume: amount. Velocity: arrival rate. Variety: formats. Veracity: trustworthiness. Value: useful outcomes. Connect a V to equipment, then identify an efficiency option.'},
  {id: 'structure', label: 'Data Structure Spectrum', guidance: 'Compare tabular records, JSON with keys and nested values, and media such as images or audio. AI systems can use all three. Format alone does not determine size or infrastructure needs.'},
  {id: 'distributed', label: 'Distributed Systems', guidance: 'Consider parallel compute, storage across a cluster, replication, and network bottlenecks. Explain both the benefit of adding machines and the cost of coordinating them.'},
] as const;
type TrackId = typeof tracks[number]['id'];
interface TeamNotes {definition: string; example: string; infrastructure: string}
type Draft = Record<TrackId, TeamNotes>;
const initial: Draft = {
  fiveVs: {definition: '', example: '', infrastructure: ''},
  structure: {definition: '', example: '', infrastructure: ''},
  distributed: {definition: '', example: '', infrastructure: ''},
};
function valid(value: unknown): value is Draft {
  if (!value || typeof value !== 'object') return false;
  return tracks.every(({id}) => {
    const item = (value as Record<string, unknown>)[id];
    return item !== null && typeof item === 'object' && ['definition', 'example', 'infrastructure']
      .every((key) => typeof (item as Record<string, unknown>)[key] === 'string');
  });
}
export function synthesisMarkdown(draft: Draft): string {
  return '# Big Data → Physical Infrastructure: Team Synthesis\n\n' + tracks.map(({id, label}) => {
    const notes = draft[id];
    return `## ${label}\n\n| Prompt | Team response |\n| --- | --- |\n| Core concept | ${markdownCell(notes.definition)} |\n| Reading example / source | ${markdownCell(notes.example)} |\n| Infrastructure connection | ${markdownCell(notes.infrastructure)} |`;
  }).join('\n\n');
}

export default function TechSynthesisBuilder() {
  const id = useId();
  const {draft, setDraft, ready, saved, storageMessage} = useSavedDraft('cis1001.unit6.synthesis.v1', initial, valid);
  const fields: {key: keyof TeamNotes; label: string; hint: string}[] = [
    {key: 'definition', label: 'Core Concept Definition (in your team’s words)', hint: 'Explain the concept for a classmate who has not read your track.'},
    {key: 'example', label: 'Real-World Example from the Readings', hint: 'Name the source and include its URL or section so another team can check your evidence.'},
    {key: 'infrastructure', label: 'Why does this force companies to build massive physical data centers?', hint: 'Describe the pressure on compute, storage, networking, power, or cooling. Is a hyperscale center inevitable, or could reducing or distributing the workload help?'},
  ];
  return <section className={styles.activity} aria-label="Technical synthesis builder">
    <p className="eyebrow">Part 1 · Team workspace</p>
    <h3>Connect the concept to the campus</h3>
    <p>Complete your assigned track. The export includes all three tracks so a team can also build a combined summary.</p>
    <p role="status" className={styles.small}>{storageMessage} {saved ? 'Draft saved locally.' : ''} Notes are not shared between devices. Avoid personal information on a shared computer.</p>
    <AccessibleTabs label="Technical pillars" tabs={tracks}>{(active) => {
      const track = tracks.find((item) => item.id === active)!;
      return <div className={styles.panel}>
        <p className={styles.guidance}>{track.guidance}</p>
        {fields.map(({key, label, hint}) => <div className={styles.field} key={key}>
          <label htmlFor={`${id}-${active}-${key}`}>{label}</label>
          <p id={`${id}-${active}-${key}-hint`} className={styles.small}>{hint}</p>
          <textarea id={`${id}-${active}-${key}`} aria-describedby={`${id}-${active}-${key}-hint`} rows={4}
            disabled={!ready} value={draft[track.id][key]} onChange={(event) => {
              const text = event.target.value;
              setDraft((current) => ({...current, [track.id]: {...current[track.id], [key]: text}}));
            }} />
        </div>)}
      </div>;
    }}</AccessibleTabs>
    <CopySummary text={synthesisMarkdown(draft)} label="Copy Markdown Summary for Class Google Doc" />
  </section>;
}
