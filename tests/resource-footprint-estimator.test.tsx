import {afterEach, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToString} from 'react-dom/server';
import ResourceFootprintEstimator from '../src/components/ResourceFootprintEstimator';

afterEach(() => vi.restoreAllMocks());

it('works without reading or changing local drafts, and resets on remount', async () => {
  const get = vi.spyOn(Storage.prototype, 'getItem');
  const set = vi.spyOn(Storage.prototype, 'setItem');
  const remove = vi.spyOn(Storage.prototype, 'removeItem');
  expect(renderToString(<ResourceFootprintEstimator />)).toContain('not a forecast for Hermantown');
  const view = render(<ResourceFootprintEstimator />);
  const user = userEvent.setup();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', {name: 'Copy Group Reflection'})).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('slider'), {target: {value: '100'}});
  await user.click(screen.getByLabelText('Closed-Loop / Advanced Air Cooling (Hermantown Proposal)'));
  expect(screen.getByRole('status', {name: 'Resource footprint estimates'})).toHaveTextContent('125 MW');
  expect(screen.getByRole('status', {name: 'Resource footprint estimates'})).toHaveTextContent('10,500 US gal/day');
  await user.click(screen.getByRole('button', {name: 'Reset scenario'}));
  expect(screen.getByRole('slider')).toHaveValue('200');
  fireEvent.change(screen.getByRole('slider'), {target: {value: '700'}});
  view.unmount();
  render(<ResourceFootprintEstimator />);
  expect(screen.getByRole('slider')).toHaveValue('200');
  expect(screen.getByLabelText('Evaporative Water Cooling (Standard Climate / Cool Northern Average)')).toBeChecked();
  expect(get).not.toHaveBeenCalled();
  expect(set).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
});
