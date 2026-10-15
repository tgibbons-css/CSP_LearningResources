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

  it('preserves restored drafts, switches tabs by keyboard, and restores notes across remounts', async () => {
    const user = userEvent.setup();
    const saved = {fiveVs: {definition: 'A saved definition', example: 'IBM', infrastructure: 'More storage'}, structure: {definition: '', example: '', infrastructure: ''}, distributed: {definition: '', example: '', infrastructure: ''}};
    localStorage.setItem('cis1001.unit6.synthesis.v1', JSON.stringify(saved));
    const view = render(<TechSynthesisBuilder />);
    await waitFor(() => expect(screen.getByLabelText(/Core Concept Definition/)).toHaveValue('A saved definition'));
    const first = screen.getByRole('tab', {name: 'The 5 V’s of Big Data'});
    first.focus(); await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', {name: 'Data Structure Spectrum'})).toHaveFocus();
    expect(screen.getByRole('tab', {name: 'Data Structure Spectrum'})).toHaveAttribute('aria-selected', 'true');
    await user.type(screen.getByLabelText(/Core Concept Definition/), 'JSON keeps keys.');
    await user.click(screen.getByRole('tab', {name: 'Distributed Systems'}));
    await user.type(screen.getByLabelText(/Core Concept Definition/), 'Machines cooperate.');
    view.unmount(); render(<TechSynthesisBuilder />);
    await waitFor(() => expect(screen.getByLabelText(/Core Concept Definition/)).toHaveValue('A saved definition'));
    await user.click(screen.getByRole('tab', {name: 'Data Structure Spectrum'}));
    expect(screen.getByLabelText(/Core Concept Definition/)).toHaveValue('JSON keeps keys.');
    await user.click(screen.getByRole('tab', {name: 'Distributed Systems'}));
    expect(screen.getByLabelText(/Core Concept Definition/)).toHaveValue('Machines cooperate.');
    screen.getByRole('tab', {name: 'Distributed Systems'}).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', {name: 'The 5 V’s of Big Data'})).toHaveFocus();
    await user.keyboard('{End}'); expect(screen.getByRole('tab', {name: 'Distributed Systems'})).toHaveFocus();
    await user.keyboard('{Home}'); expect(screen.getByRole('tab', {name: 'The 5 V’s of Big Data'})).toHaveFocus();
  });

  it('copies all tracks with table-safe Markdown and provides a fallback when copying fails', async () => {
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<TechSynthesisBuilder />);
    await user.type(screen.getByLabelText(/Core Concept Definition/), 'Volume | size\n<example>');
    await user.click(screen.getByRole('button', {name: 'Copy Markdown Summary for Class Google Doc'}));
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('Volume \\| size<br>&lt;example&gt;'));
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('## Distributed Systems'));
    copy.mockRejectedValueOnce(new Error('Not allowed'));
    await user.click(screen.getByRole('button', {name: 'Copy Markdown Summary for Class Google Doc'}));
    expect(await screen.findByText(/Clipboard access is unavailable/)).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown summary')).toBeVisible();
  });

  it('handles invalid saved data and storage denial without disabling editing', async () => {
    localStorage.setItem('cis1001.unit6.synthesis.v1', '{broken JSON');
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
