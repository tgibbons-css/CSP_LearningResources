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
    expect(screen.getByRole('status', {name: 'Resource footprint estimates'})).toHaveTextContent('60 MW');
    await user.click(screen.getByLabelText('Closed-Loop / Advanced Air Cooling'));
    expect(screen.getByRole('status', {name: 'Resource footprint estimates'})).toHaveTextContent('67.5 MW');
    expect(screen.getByRole('status', {name: 'Resource footprint estimates'})).toHaveTextContent('60,000 L/day');
    fireEvent.change(slider, {target: {value: '700'}});
    expect(screen.getByRole('status', {name: 'Resource footprint estimates'})).toHaveTextContent('945 MW');
    await user.type(screen.getByLabelText('Condition 1 — evidence and monitoring'), 'Publish monthly energy reports.');
    await user.click(screen.getByRole('button', {name: 'Copy Group Reflection'}));
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('NOT a Hermantown forecast'));
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('Publish monthly energy reports.'));
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('IT compute load: 700 MW'));
    await user.click(screen.getByRole('button', {name: 'Reset scenario'}));
    expect(slider).toHaveValue('200');
    expect(screen.getByLabelText('Traditional Evaporative Water Cooling')).toBeChecked();
    view.unmount(); render(<HermantownJigsawExplorer />);
    await waitFor(() => expect(screen.getByLabelText('Condition 1 — evidence and monitoring')).toHaveValue('Publish monthly energy reports.'));
  });
});

it('uses consistent energy and water units and separates overhead from IT load', () => {
  const wet = estimateFootprint(100, 'evaporative');
  const air = estimateFootprint(100, 'air');
  expect(wet.facilityMw).toBe(120);
  expect(wet.overheadMw).toBe(20);
  expect(wet.dailyMwh).toBe(2880);
  expect(wet.waterLiters).toBe(4_320_000);
  expect(wet.waterGallons).toBeCloseTo(1_141_223.265, 2);
  expect(wet.homes).toBeCloseTo(120 * 1000 * 8760 / 10791);
  expect(air.waterLiters).toBe(120_000);
  expect(air.facilityMw).toBeGreaterThan(wet.facilityMw);
  for (const load of [49, 701, NaN, Infinity]) expect(() => estimateFootprint(load, 'air')).toThrow(RangeError);
});
