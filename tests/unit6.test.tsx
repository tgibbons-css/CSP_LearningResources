import {afterEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import TechSynthesisBuilder from '../src/components/Unit6/TechSynthesisBuilder';
import HermantownJigsawExplorer from '../src/components/Unit6/HermantownJigsawExplorer';
import {estimateFootprint} from '../src/components/Unit6/footprintModel';

afterEach(() => {vi.restoreAllMocks(); window.localStorage.clear();});

describe('Unit 6 workspaces', () => {
  it('renders on the server without touching browser storage', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem');
    const set = vi.spyOn(Storage.prototype, 'setItem');
    expect(renderToString(<><TechSynthesisBuilder /><HermantownJigsawExplorer /></>)).toContain('Resource footprint estimator');
    expect(get).not.toHaveBeenCalled(); expect(set).not.toHaveBeenCalled();
  });

  it('restores five-team drafts and supports keyboard navigation without changing old drafts', async () => {
    const user = userEvent.setup();
    const oldDraft = JSON.stringify({fiveVs: {definition: 'Legacy notes'}});
    localStorage.setItem('cis1001.unit6.synthesis.v1', oldDraft);
    const saved = Object.fromEntries(['volume', 'velocity', 'variety', 'veracity', 'value'].map((id) =>
      [id, {definition: id === 'volume' ? 'A saved definition' : '', example: '', quote: '', question: ''}]));
    localStorage.setItem('cis1001.unit6.synthesis.v2', JSON.stringify(saved));
    const view = render(<TechSynthesisBuilder />);
    await waitFor(() => expect(screen.getByLabelText(/Core Concept Definition/)).toHaveValue('A saved definition'));
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Volume', 'Velocity', 'Variety', 'Veracity', 'Value']);
    screen.getByRole('tab', {name: 'Volume'}).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', {name: 'Velocity'})).toHaveFocus();
    expect(screen.getByRole('tab', {name: 'Velocity'})).toHaveAttribute('aria-selected', 'true');
    await user.type(screen.getByLabelText(/Quote from a Source/), 'A quote. https://example.com/velocity');
    await user.type(screen.getByLabelText(/Question or Trade-off/), 'How fast is fast enough?');
    await user.click(screen.getByRole('tab', {name: 'Value'}));
    await user.type(screen.getByLabelText(/Core Concept Definition/), 'Useful outcomes.');
    view.unmount(); render(<TechSynthesisBuilder />);
    await waitFor(() => expect(screen.getByLabelText(/Core Concept Definition/)).toHaveValue('A saved definition'));
    await user.click(screen.getByRole('tab', {name: 'Velocity'}));
    expect(screen.getByLabelText(/Quote from a Source/)).toHaveValue('A quote. https://example.com/velocity');
    expect(screen.getByLabelText(/Question or Trade-off/)).toHaveValue('How fast is fast enough?');
    screen.getByRole('tab', {name: 'Velocity'}).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', {name: 'Value'})).toHaveFocus();
    expect(screen.getByLabelText(/Core Concept Definition/)).toHaveValue('Useful outcomes.');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', {name: 'Volume'})).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', {name: 'Value'})).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', {name: 'Volume'})).toHaveFocus();
    expect(localStorage.getItem('cis1001.unit6.synthesis.v1')).toBe(oldDraft);
  });

  it('copies only the selected V including quote and source, with safe Markdown and copy fallback', async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<TechSynthesisBuilder />);
    expect(screen.getByRole('link', {name: "Open Shared 5 V's Synthesis Document"})).toHaveAttribute('href',
      'https://docs.google.com/document/d/1sxQy6eFQVi9U4ShmW25m76Uzs_shPyw7uTz9tJeR0Qo/edit?usp=sharing');
    await user.type(screen.getByLabelText(/Core Concept Definition/), 'Volume notes stay separate.');
    await user.click(screen.getByRole('tab', {name: 'Veracity'}));
    await user.type(screen.getByLabelText(/Quote from a Source/), 'Trust | data\n<quote> https://example.com/source');
    await user.type(screen.getByLabelText(/Question or Trade-off/), 'Who checks accuracy?');
    await user.click(screen.getByRole('button', {name: "Copy This Team's Summary"}));
    const output = copy.mock.calls[0][0];
    expect(output).toContain('## Veracity');
    expect(output).toContain('Trust \\| data<br>&lt;quote&gt; https://example.com/source');
    expect(output).toContain('Who checks accuracy?');
    expect(output).not.toContain('Volume notes stay separate.');
    expect(output).not.toContain('## Volume');
    copy.mockRejectedValueOnce(new Error('Not allowed'));
    await user.click(screen.getByRole('button', {name: "Copy This Team's Summary"}));
    expect(await screen.findByText(/Clipboard access is unavailable/)).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown summary')).toBeVisible();
  });

  it('handles invalid saved data and storage denial without disabling editing', async () => {
    localStorage.setItem('cis1001.unit6.synthesis.v2', '{broken JSON');
    const view = render(<TechSynthesisBuilder />);
    expect(await screen.findByText(/Saved notes could not be restored/)).toBeInTheDocument();
    view.unmount();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {throw new Error('SecurityError');});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {throw new Error('QuotaExceeded');});
    render(<TechSynthesisBuilder />);
    expect(await screen.findByText(/Browser storage is unavailable/)).toBeInTheDocument();
    const input = screen.getByLabelText(/Core Concept Definition/);
    expect(input).toBeEnabled();
    fireEvent.change(input, {target: {value: 'Still usable'}});
    expect(input).toHaveValue('Still usable');
  });

  it('compares cooling, slider bounds, expert pods, reset, and group reflection export', async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const view = render(<HermantownJigsawExplorer />);
    await user.click(screen.getByRole('tab', {name: 'Pod 2: Water & Cooling Systems'}));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('trout streams');
    expect(screen.getByRole('link', {name: 'MPR · reported cooling options'})).toHaveAttribute('href', expect.stringContaining('mprnews.org'));
    const slider = screen.getByRole('slider', {name: /Compute Load/});
    fireEvent.change(slider, {target: {value: '50'}});
    expect(screen.getByRole('status', {name: 'Resource footprint estimates'})).toHaveTextContent('56 MW');
    await user.click(screen.getByLabelText('Closed-Loop / Advanced Air Cooling (Hermantown Proposal)'));
    expect(screen.getByRole('status', {name: 'Resource footprint estimates'})).toHaveTextContent('62.5 MW');
    expect(screen.getByRole('status', {name: 'Resource footprint estimates'})).toHaveTextContent('9,250 US gal/day');
    fireEvent.change(slider, {target: {value: '700'}});
    expect(screen.getByRole('status', {name: 'Resource footprint estimates'})).toHaveTextContent('875 MW');
    await user.type(screen.getByLabelText('Condition 1 — evidence and monitoring'), 'Publish monthly energy reports.');
    await user.click(screen.getByRole('button', {name: 'Copy Group Reflection'}));
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('NOT a Hermantown forecast'));
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('Publish monthly energy reports.'));
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('IT compute load: 700 MW'));
    await user.click(screen.getByRole('button', {name: 'Reset scenario'}));
    expect(slider).toHaveValue('200');
    expect(screen.getByLabelText('Evaporative Water Cooling (Standard Climate / Cool Northern Average)')).toBeChecked();
    view.unmount(); render(<HermantownJigsawExplorer />);
    await waitFor(() => expect(screen.getByLabelText('Condition 1 — evidence and monitoring')).toHaveValue('Publish monthly energy reports.'));
  });
});

it('uses IT energy for WUE, facility power for homes, and separate municipal water for dry cooling', () => {
  for (const load of [50, 100, 300, 600, 700]) {
    for (const [scenario, pue, wue] of [
      ['evaporative', 1.12, 0.85], ['evaporativePeak', 1.15, 1.8], ['air', 1.25, 0],
    ] as const) {
      const result = estimateFootprint(load, scenario);
      expect(result.dailyITEnergyKWh).toBe(load * 24_000);
      expect(result.totalFacilityMW).toBeCloseTo(load * pue);
      expect(result.coolingPowerOverheadMW).toBeCloseTo(load * (pue - 1));
      expect(result.dailyFacilityEnergyKWh).toBeCloseTo(load * pue * 24_000);
      expect(result.equivalentHomes).toBe(Math.round(load * pue * 1000 / 1.2));
      expect(result.dailyWaterGallons).toBe(scenario === 'air'
        ? Math.round(8000 + load * 25) : Math.round(load * 24_000 * wue / 3.78541));
    }
  }
  expect(estimateFootprint(100, 'evaporative').dailyWaterGallons).toBe(538911);
  expect(estimateFootprint(100, 'evaporativePeak').dailyWaterGallons).toBe(1141224);
  expect(estimateFootprint(100, 'air').dailyWaterGallons).toBe(10500);
  for (const load of [49, 701, NaN, Infinity]) expect(() => estimateFootprint(load, 'air')).toThrow(RangeError);
});

it('switches the peak scenario, exposes formulas, and exports the selected water boundary', async () => {
  const user = userEvent.setup();
  const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  render(<HermantownJigsawExplorer />);
  fireEvent.change(screen.getByRole('slider'), {target: {value: '100'}});
  await user.click(screen.getByLabelText('Evaporative Water Cooling (Peak Hot Day / National Comparison)'));
  const results = screen.getByRole('status', {name: 'Resource footprint estimates'});
  expect(results).toHaveTextContent('1,141,224 US gal/day');
  expect(results).toHaveTextContent('95,833 homes');
  await user.click(screen.getByText('How is this calculated? (WUE & PUE Math)'));
  expect(screen.getByText(/dailyITEnergyKWh = computeLoadMW/)).toBeVisible();
  await user.click(screen.getByLabelText('Closed-Loop / Advanced Air Cooling (Hermantown Proposal)'));
  expect(results).toHaveTextContent('10,500 US gal/day');
  expect(screen.getByText(/This air-cooled/)).toHaveTextContent('ZERO water for server cooling');
  expect(screen.getByLabelText('Indirect power-plant water')).toHaveTextContent('4,500,000-6,000,000 gal/day');
  await user.click(screen.getByRole('button', {name: 'Copy Group Reflection'}));
  expect(copy).toHaveBeenCalledWith(expect.stringContaining('zero evaporative server cooling'));
  expect(copy).toHaveBeenCalledWith(expect.stringContaining('10,500 US gal/day'));
});
