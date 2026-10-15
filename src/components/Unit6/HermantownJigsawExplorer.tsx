import {useId, useState} from 'react';
import AccessibleTabs from './AccessibleTabs';
import CopySummary, {markdownCell} from './CopySummary';
import useSavedDraft from './useSavedDraft';
import {annualHomeKwh, coolingModels, estimateFootprint, type Cooling} from './footprintModel';
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
- Assumed PUE: ${selected.pue}; assumed direct water draw: ${selected.litersPerItKwh} L/IT kWh.
- Total facility demand: ${number(estimate.facilityMw)} MW; overhead: ${number(estimate.overheadMw)} MW.
- Daily electricity: ${number(estimate.dailyMwh)} MWh; on-site water draw: ${number(estimate.waterLiters)} L/day.
- Comparable annual US residential electricity purchases: about ${Math.round(estimate.homes).toLocaleString('en-US')} customers (EIA 2022 baseline).
- Assumptions are illustrative, not measured site data. No indirect water, carbon, cost, or ecological-impact model is included.
- The announced 700 MW wind/storage package is not a confirmed facility load or continuous generation guarantee.

## Sources to check against our conditions
- City project documents: ${localSources.project}
- MPR June 25, 2026: ${localSources.mpr}
- Utility announcement: ${localSources.utility}
`;
  return <section className={styles.activity} aria-label="Hermantown jigsaw explorer">
    <p className="eyebrow">Part 2 · Expert pods → home group</p>
    <h3>Four perspectives, one shared decision</h3>
    <p>Case facts below describe March–June 2026 sources, reviewed October 14, 2026. Use the <a href={localSources.project}>City project page</a> to investigate later updates. Separate a source’s claims from your interpretation.</p>
    <AccessibleTabs label="Expert pods" tabs={pods}>{(active) => {
      const pod = pods.find((item) => item.id === active)!;
      return <div className={styles.panel}>
        <p className={styles.guidance}>{pod.fact}</p>
        <h4>Questions for your expert pod</h4>
        <ul>{pod.questions.map((question) => <li key={question}>{question}</li>)}</ul>
        <h4>Evidence to bring back</h4>
        <ul>{pod.sources.map((source) => <li key={source.url}><a href={source.url}>{source.label}</a></li>)}</ul>
        <p>Bring one supported claim, one unresolved question, and one proposed condition to your home group.</p>
      </div>;
    }}</AccessibleTabs>

    <h3>Resource footprint estimator</h3>
    <div className={styles.notice}>
      <strong>Illustrative classroom model — not a forecast for Hermantown.</strong>
      <p>The 50–700 MW slider represents a hypothetical IT load, not a disclosed site rating. The two cooling settings deliberately simplify a range of real designs. Weather, utilization, equipment, and water source can change the trade-off.</p>
    </div>
    <div className={styles.field}>
      <label htmlFor={`${id}-load`}>Compute Load (MW): {compute}</label>
      <p id={`${id}-load-help`} className={styles.small}>IT power only; use arrow keys to adjust in 10 MW steps. Minimum 50 MW, maximum 700 MW.</p>
      <input id={`${id}-load`} type="range" min={50} max={700} step={10} value={compute}
        aria-describedby={`${id}-load-help`} onChange={(event) => setCompute(Number(event.target.value))} />
    </div>
    <fieldset className={styles.cooling}>
      <legend>Cooling architecture</legend>
      {(Object.keys(coolingModels) as Cooling[]).map((key) => <label key={key}>
        <input type="radio" name={`${id}-cooling`} checked={cooling === key} value={key}
          onChange={() => setCooling(key)} /> {coolingModels[key].label}
      </label>)}
    </fieldset>
    <div role="status" aria-label="Resource footprint estimates" aria-live="polite" aria-atomic="true" className={styles.results}>
      <dl>
        <div><dt>Total facility electricity demand</dt><dd>{number(estimate.facilityMw)} MW</dd></div>
        <div><dt>Facility overhead above IT load</dt><dd>{number(estimate.overheadMw)} MW</dd></div>
        <div><dt>Daily facility electricity</dt><dd>{number(estimate.dailyMwh)} MWh/day</dd></div>
        <div><dt>Estimated direct on-site water draw</dt><dd>{number(estimate.waterLiters)} L/day <span>≈ {number(estimate.waterGallons)} US gal/day</span></dd></div>
        <div><dt>Equivalent average residential electricity purchases</dt><dd>≈ {Math.round(estimate.homes).toLocaleString('en-US')} homes <span>Annual-energy comparison, not homes actually supplied</span></dd></div>
      </dl>
    </div>
    <button className="button button--secondary" type="button" onClick={() => {setCompute(200); setCooling('evaporative');}}>Reset scenario</button>
    <details className={styles.assumptions}>
      <summary>Show assumptions, formulas, and limitations</summary>
      <p>The following coefficients were chosen for teaching. They are not Google design values, industry guarantees, or regulatory estimates.</p>
      <table><caption>Illustrative scenario coefficients</caption><thead><tr><th>Scenario</th><th>PUE</th><th>Direct water draw (L/IT kWh)</th></tr></thead>
        <tbody>{Object.values(coolingModels).map((model) => <tr key={model.label}><th scope="row">{model.label}</th><td>{model.pue}</td><td>{model.litersPerItKwh}</td></tr>)}</tbody></table>
      <ul>
        <li>Total facility MW = IT MW × PUE (total facility power / IT power). Overhead includes cooling and other facility systems.</li>
        <li>Daily MWh = facility MW × 24, assuming constant load; water L/day = IT MW × 1,000 × 24 × the selected water coefficient.</li>
        <li>Homes comparison = facility MW × 1,000 × 8,760 / {annualHomeKwh.toLocaleString('en-US')}. The denominator is <a href="https://www.eia.gov/tools/faqs/faq.php?id=97&t=3">EIA’s 2022 US average annual purchases per residential customer</a>, not a Minnesota-specific demand or peak-load value.</li>
        <li>Low-water cooling is not necessarily zero-water cooling. Closed-loop and advanced air designs differ; this single setting is a teaching simplification.</li>
        <li>Direct water draw is not the same as consumptive loss or ecological damage. This model omits indirect water used in generating electricity, seasonal flows, emissions, costs, and construction.</li>
        <li>The 700 MW resource announcement includes battery power capacity; MWh storage duration, timing, and utilization are needed to assess actual supply.</li>
      </ul>
    </details>

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
