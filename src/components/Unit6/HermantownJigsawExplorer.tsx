import {useId, useState} from 'react';
import AccessibleTabs from './AccessibleTabs';
import {ResourceFootprintControls} from '../ResourceFootprintEstimator';
import CopySummary, {markdownCell} from './CopySummary';
import useSavedDraft from './useSavedDraft';
import {coolingModels, estimateFootprint, type Cooling} from './footprintModel';
import {pods, localSources} from './resources';
import styles from './Unit6.module.css';

interface GroupDraft {first: string; second: string; third: string}
const empty: GroupDraft = {first: '', second: '', third: ''};
function valid(value: unknown): value is GroupDraft {
  return value !== null && typeof value === 'object' && ['first', 'second', 'third']
    .every((key) => typeof (value as Record<string, unknown>)[key] === 'string');
}
const number = (value: number) => new Intl.NumberFormat('en-US', {maximumFractionDigits: 1}).format(value);

export default function HermantownJigsawExplorer() {
  const id = useId();
  const [compute, setCompute] = useState(200);
  const [cooling, setCooling] = useState<Cooling>('evaporative');
  const {draft, setDraft, ready, storageMessage} = useSavedDraft('cis1001.unit6.jigsaw.v1', empty, valid);
  const estimate = estimateFootprint(compute, cooling);
  const selected = coolingModels[cooling];
  const reflection = `# Hermantown Jigsaw: Home Group Reflection

## Three conditions we recommend
1. ${markdownCell(draft.first)}
2. ${markdownCell(draft.second)}
3. ${markdownCell(draft.third)}

## Classroom scenario (NOT a Hermantown forecast)
- IT compute load: ${compute} MW, held constant for 24 hours/day.
- Cooling scenario: ${selected.label}.
- Assumed PUE: ${selected.pue}; assumed cooling WUE: ${selected.litersPerItKwh} L/IT kWh.
- Total facility demand: ${number(estimate.totalFacilityMW)} MW; overhead: ${number(estimate.coolingPowerOverheadMW)} MW.
- Daily IT electricity: ${number(estimate.dailyITEnergyKWh)} kWh/day; facility electricity: ${number(estimate.dailyFacilityEnergyKWh)} kWh/day.
- Direct on-site water: ${number(estimate.dailyWaterGallons)} US gal/day (${cooling === 'air' ? 'domestic/staff needs and humidification; zero evaporative server cooling' : 'evaporative cooling WUE estimate'}).
- Equivalent homes: ${estimate.equivalentHomes.toLocaleString('en-US')} at 1.2 kW continuous average household demand (28.8 kWh/day).
- Assumptions are illustrative, not measured site data. The separate off-site water sensitivity is not included in this export; no carbon, cost, or ecological-impact model is included.
- The announced 700 MW wind/storage package is not a confirmed facility load or continuous generation guarantee.

## Sources to check against our conditions
- City project documents: ${localSources.project}
- MPR June 25, 2026: ${localSources.mpr}
- Utility announcement: ${localSources.utility}
`;
  return <section className={styles.activity} aria-label="Hermantown jigsaw explorer">
    <p className="eyebrow">Part 2 · Expert pods → home group</p>
    <h3>Four perspectives, one shared decision</h3>
    <p>Case facts below describe March–June 2026 sources, reviewed October 14, 2026. Use the <a target="_blank" rel="noopener noreferrer" href={localSources.project}>City project page</a> to investigate later updates. Separate a source’s claims from your interpretation.</p>
    <AccessibleTabs label="Expert pods" tabs={pods}>{(active) => {
      const pod = pods.find((item) => item.id === active)!;
      return <div className={styles.panel}>
        <p className={styles.guidance}>{pod.fact}</p>
        <h4>Questions for your expert pod</h4>
        <ul>{pod.questions.map((question) => <li key={question}>{question}</li>)}</ul>
        <h4>Evidence to bring back</h4>
        <ul>{pod.sources.map((source) => <li key={source.url}><a target="_blank" rel="noopener noreferrer" href={source.url}>{source.label}</a></li>)}</ul>
        <p>Bring one supported claim, one unresolved question, and one proposed condition to your home group.</p>
      </div>;
    }}</AccessibleTabs>

    <h3>Resource footprint estimator</h3>
    <ResourceFootprintControls compute={compute} cooling={cooling} setCompute={setCompute} setCooling={setCooling} />
    <h3>Home-group consensus: three conditions</h3>
    <p>Propose three conditions the City and utility regulators should require. For each, name the responsible party, a measurable protection, a source, and how compliance would be reported. You may reach different conclusions if you support them with evidence.</p>
    <p className={styles.small}>{storageMessage} Nothing is sent to your instructor automatically.</p>
    {(['first', 'second', 'third'] as const).map((key, index) => <div className={styles.field} key={key}>
      <label htmlFor={`${id}-${key}`}>Condition {index + 1} — evidence and monitoring</label>
      <textarea id={`${id}-${key}`} rows={4} value={draft[key]} disabled={!ready}
        onChange={(event) => {const text = event.target.value; setDraft((current) => ({...current, [key]: text}));}} />
    </div>)}
    <CopySummary text={reflection} label="Copy Group Reflection" />
  </section>;
}
