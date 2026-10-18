import {useId, useState} from 'react';
import {coolingModels, estimateFootprint, type Cooling} from '../Unit6/footprintModel';
import {localSources} from '../Unit6/resources';
import styles from '../Unit6/Unit6.module.css';

const number = (value: number) => new Intl.NumberFormat('en-US', {maximumFractionDigits: 1}).format(value);

type Props = {
  compute: number;
  cooling: Cooling;
  setCompute: (value: number) => void;
  setCooling: (value: Cooling) => void;
};

// Shared controls also preserve the legacy workspace's scenario export.
export function ResourceFootprintControls({compute, cooling, setCompute, setCooling}: Props) {
  const id = useId();
  const estimate = estimateFootprint(compute, cooling);
  const selected = coolingModels[cooling];
  return <>

    <p><strong>PUE means Power Usage Effectiveness:</strong> total facility energy divided by IT equipment energy over the same period. A PUE of 1.25 means 1 kWh for IT equipment plus 0.25 kWh for cooling and other facility overhead. Lower PUE means less overhead per unit of IT energy; it does not measure water use.</p>
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
        <div><dt>Power Usage Effectiveness (PUE)</dt><dd>{selected.pue} <span>Total facility energy / IT equipment energy</span></dd></div>
        <div><dt>Cooling Water Usage Effectiveness (WUE)</dt><dd>{selected.litersPerItKwh} L/kWh</dd></div>
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

  </>;
}

export default function ResourceFootprintEstimator() {
  const [compute, setCompute] = useState(200);
  const [cooling, setCooling] = useState<Cooling>('evaporative');
  return <section className={styles.activity} aria-label="Resource footprint estimator">
    <ResourceFootprintControls compute={compute} cooling={cooling} setCompute={setCompute} setCooling={setCooling} />
    <p className={styles.small}>Record useful scenarios and their assumptions in your assigned Google Doc. Calculator settings reset when you leave or reload this page.</p>
  </section>;
}
