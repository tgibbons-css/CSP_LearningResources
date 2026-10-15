import {useId, useState} from 'react';
import AccessibleTabs from './AccessibleTabs';
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
    <div className={styles.notice}>
      <strong>Illustrative classroom model — not a forecast for Hermantown.</strong>
      <p>The 50–700 MW slider represents a hypothetical IT load, not a disclosed site rating. The three cooling scenarios deliberately simplify a range of real designs. Weather, utilization, equipment, and water source can change the trade-off.</p>
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
        <div><dt>Daily IT energy</dt><dd>{number(estimate.dailyITEnergyKWh)} kWh/day</dd></div>
        <div><dt>Selected PUE / cooling WUE</dt><dd>{selected.pue} / {selected.litersPerItKwh} L/kWh</dd></div>
        <div><dt>Total facility power</dt><dd>{number(estimate.totalFacilityMW)} MW</dd></div>
        <div><dt>Cooling / other facility power overhead above IT load</dt><dd>{number(estimate.coolingPowerOverheadMW)} MW</dd></div>
        <div><dt>Daily facility electricity</dt><dd>{number(estimate.dailyFacilityEnergyKWh)} kWh/day</dd></div>
        <div><dt>Direct on-site daily water {cooling === 'air' ? '(domestic / humidification)' : '(evaporative cooling)'}</dt><dd>{number(estimate.dailyWaterGallons)} US gal/day</dd></div>
        <div><dt>Equivalent average residential homes</dt><dd>About {estimate.equivalentHomes.toLocaleString('en-US')} homes <span>At 1.2 kW continuously per household; a demand comparison, not homes actually supplied</span></dd></div>
      </dl>
    </div>
    <button className="button button--secondary" type="button" onClick={() => {setCompute(200); setCooling('evaporative');}}>Reset scenario</button>
    <p>{cooling === 'air'
      ? 'This air-cooled / closed-loop scenario evaporates ZERO water for server cooling (cooling WUE = 0 L/kWh). Municipal water serves domestic/staff needs and humidification. The formula gives 9,250-25,500 gal/day across this slider, roughly 10,000-25,000 gal/day. Extra electricity powers fans/chillers instead of evaporating water.'
      : 'Water is estimated from IT energy, not total facility energy. The cool northern average and hot-day settings are illustrative climate scenarios, not measured Hermantown performance.'}</p>
    <details className={styles.assumptions}>
      <summary>How is this calculated? (WUE &amp; PUE Math)</summary>
      <p>PUE (Power Usage Effectiveness) = total facility energy / IT equipment energy over the same period. WUE (Water Usage Effectiveness) = on-site water in liters / IT equipment energy in kWh. With constant power for 24 hours, the energy ratio also gives the power ratio used here.</p>
      <table><caption>Scenario assumptions, not prescribed ISO values or verified national averages</caption><thead><tr><th>Scenario</th><th>PUE</th><th>Cooling WUE (L/IT kWh)</th></tr></thead>
        <tbody>{Object.values(coolingModels).map((model) => <tr key={model.label}><th scope="row">{model.label}</th><td>{model.pue}</td><td>{model.litersPerItKwh}</td></tr>)}</tbody></table>
      <pre>{`dailyITEnergyKWh = computeLoadMW * 1000 * 24;
totalFacilityMW = computeLoadMW * pue;
coolingPowerOverheadMW = totalFacilityMW - computeLoadMW;
dailyFacilityEnergyKWh = totalFacilityMW * 1000 * 24;
equivalentHomes = Math.round((totalFacilityMW * 1000) / 1.2);
// Evaporative cooling: WUE = 0.85 or 1.8 L/kWh
dailyWaterGallons = Math.round((dailyITEnergyKWh * wue) / 3.78541);
// Air / closed-loop scenario: cooling WUE = 0; other municipal use
dailyWaterGallons = Math.round(8000 + (computeLoadMW * 25));`}</pre>
      <p>1 MW = 1,000 kW; kW * hours = kWh; 1 US gallon = 3.78541 liters. The household baseline is 1.2 kW continuously = 28.8 kWh/day = 10,512 kWh/year (about 10,500), a rounded teaching assumption rather than a Minnesota measurement.</p>
      <p>At 100 MW IT load, the evaporative estimates are {number(estimateFootprint(100, 'evaporative').dailyWaterGallons)} gal/day (0.85 L/kWh) and {number(estimateFootprint(100, 'evaporativePeak').dailyWaterGallons)} gal/day (1.8 L/kWh). The air scenario gives 10,500 gal/day for non-cooling uses.</p>
      <p>Overhead includes cooling, power conversion, and other facility systems; PUE cannot isolate cooling power. Zero cooling WUE describes this dry heat-rejection scenario, not every closed-loop design, and excludes its nonzero domestic/humidification water. These daily estimates are not measured annual ISO KPIs. Water use, withdrawal, and consumptive loss require consistent reporting boundaries; they are not interchangeable.</p>
      <p>Definitions and context: <a target="_blank" rel="noopener noreferrer" href="https://www.iso.org/standard/30134-2">ISO/IEC 30134-2 (PUE)</a>, <a target="_blank" rel="noopener noreferrer" href="https://www.iso.org/standard/77692.html">ISO/IEC 30134-9 (WUE)</a>, and <a target="_blank" rel="noopener noreferrer" href="https://eta-publications.lbl.gov/sites/default/files/2024-12/us_data_center_energy_usage_report_lbnl-2001637_0.pdf">LBNL's 2024 US Data Center Energy Usage Report</a>. The report's national fleet average is not the same as an evaporative-only scenario.</p>
    </details>
    <aside className={styles.notice} aria-label="Indirect power-plant water">
      <strong>Indirect power-plant water (off-site)</strong>
      <p>As an optional sensitivity assumption, thermal/fossil generation at 1.5-2.0 gal/kWh would consume {number(Math.round(estimate.dailyFacilityEnergyKWh * 1.5))}-{number(Math.round(estimate.dailyFacilityEnergyKWh * 2))} gal/day off-site if it supplied all facility electricity. Formula: facility kWh/day * gal/kWh. This range is not a universal thermal-plant factor; fuel, cooling technology, and location matter. It is separate from the on-site estimate and is not added to it.</p>
      <p>Wind and solar avoid most operational thermal-cooling water, making electricity sourcing relevant even with dry server cooling. The <a target="_blank" rel="noopener noreferrer" href={localSources.utility}>Hermantown agreement announcement</a> specifies 300 MW wind plus 400 MW battery capacity (700 MW total), not a wind/solar/battery package. Storage is not generation, and nameplate capacity does not guarantee continuous clean supply. This model does not estimate the actual grid mix or Hermantown's off-site water consumption.</p>
    </aside>

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
