import {useId} from 'react';
import AccessibleTabs from './AccessibleTabs';
import CopySummary, {markdownCell} from './CopySummary';
import useSavedDraft from './useSavedDraft';
import styles from './Unit6.module.css';

const tracks = [
  {id: 'volume', label: 'Volume', guidance: 'How does the amount of data affect storage, replication, and processing needs?'},
  {id: 'velocity', label: 'Velocity', guidance: 'How do arrival rates and response-time expectations affect processing and networking?'},
  {id: 'variety', label: 'Variety', guidance: 'How do different formats affect storage, integration, and analysis?'},
  {id: 'veracity', label: 'Veracity', guidance: 'How do errors, missing information, and bias affect cleaning, validation, and trust?'},
  {id: 'value', label: 'Value', guidance: 'What useful outcome does the computing provide, and does it justify its resource costs?'},
] as const;
type TrackId = typeof tracks[number]['id'];
interface TeamNotes {definition: string; example: string; quote: string; question: string}
type Draft = Record<TrackId, TeamNotes>;
const initial: Draft = {
  volume: {definition: '', example: '', quote: '', question: ''},
  velocity: {definition: '', example: '', quote: '', question: ''},
  variety: {definition: '', example: '', quote: '', question: ''},
  veracity: {definition: '', example: '', quote: '', question: ''},
  value: {definition: '', example: '', quote: '', question: ''},
};
function valid(value: unknown): value is Draft {
  if (!value || typeof value !== 'object') return false;
  return tracks.every(({id}) => {
    const item = (value as Record<string, unknown>)[id];
    return item !== null && typeof item === 'object' && ['definition', 'example', 'quote', 'question']
      .every((key) => typeof (item as Record<string, unknown>)[key] === 'string');
  });
}
export function synthesisMarkdown(draft: Draft, track: typeof tracks[number]): string {
  const notes = draft[track.id];
  return `## ${track.label}\n\n| Prompt | Team response |\n| --- | --- |\n| Definition | ${markdownCell(notes.definition)} |\n| Real-world example / source | ${markdownCell(notes.example)} |\n| Quote / source link | ${markdownCell(notes.quote)} |\n| Question or trade-off | ${markdownCell(notes.question)} |`;
}

export default function TechSynthesisBuilder() {
  const id = useId();
  const {draft, setDraft, ready, saved, storageMessage} = useSavedDraft('cis1001.unit6.synthesis.v2', initial, valid);
  const fields: {key: keyof TeamNotes; label: string; hint: string}[] = [
    {key: 'definition', label: 'Core Concept Definition (in your team’s words)', hint: 'Define your assigned V for a classmate who has not read about it.'},
    {key: 'example', label: 'Real-World Example from the Readings', hint: 'Name the source and include its URL or section so another team can check your evidence.'},
    {key: 'quote', label: 'Quote from a Source (include the source link)', hint: 'Choose a short quote that helps explain your V. Use quotation marks, copy the wording accurately, and include the source name and URL.'},
    {key: 'question', label: 'Question or Trade-off for the Class', hint: 'Identify one uncertainty, trade-off, or connection to another V for classmates to discuss.'},
  ];
  return <section className={styles.activity} aria-label="Technical synthesis builder">
    <p className="eyebrow">Part 1 · Team workspace</p>
    <h3>Explore your team's V</h3>
    <p>Select your assigned V and prepare its four responses. Copy only your team's summary, then paste it into your assigned section of the shared Google Doc. This workspace does not update Google Docs automatically.</p>
    <p><a href="https://docs.google.com/document/d/1sxQy6eFQVi9U4ShmW25m76Uzs_shPyw7uTz9tJeR0Qo/edit?usp=sharing">Open Shared 5 V's Synthesis Document</a></p>
    <p role="status" className={styles.small}>{storageMessage} {saved ? 'Draft saved locally.' : ''} Notes are not shared between devices. Avoid personal information on a shared computer.</p>
    <AccessibleTabs label="The five V teams" tabs={tracks}>{(active) => {
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
        <CopySummary text={synthesisMarkdown(draft, track)} label="Copy This Team's Summary" />
      </div>;
    }}</AccessibleTabs>
  </section>;
}
