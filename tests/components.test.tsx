import {describe, expect, it} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BinaryExplorer from '../src/components/BinaryExplorer';
import SelfCheck from '../src/components/SelfCheck';
import LearningObjectives from '../src/components/LearningObjectives';
import InstructionalCallout from '../src/components/InstructionalCallout';
import ResourceCard from '../src/components/ResourceCard';

describe('BinaryExplorer', () => {
  it('supports keyboard toggles, computes a total, and resets', async () => {
    const user = userEvent.setup();
    render(<BinaryExplorer />);
    await user.tab();
    expect(screen.getByRole('button', {name: 'Bit with place value 8'})).toHaveFocus();
    await user.keyboard(' ');
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Binary 1010 = decimal 10');
    expect(screen.getByRole('button', {name: 'Bit with place value 8'})).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', {name: 'Reset bits'}));
    expect(screen.getByRole('status')).toHaveTextContent('Binary 0000 = decimal 0');
  });
});

describe('SelfCheck', () => {
  const props = {question: 'Choose ten', options: [{id: 'a', text: 'Six'}, {id: 'b', text: 'Ten'}], correctAnswer: 'b', explanation: 'Eight plus two is ten.'};
  it('requires a selection, gives feedback, retries, and resets', async () => {
    const user = userEvent.setup();
    render(<SelfCheck {...props} />);
    expect(screen.getByRole('group', {name: props.question})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Check answer'})).toBeDisabled();
    await user.click(screen.getByLabelText('Six'));
    await user.click(screen.getByRole('button', {name: 'Check answer'}));
    expect(screen.getByRole('status')).toHaveTextContent('Not quite. Try again.');
    await user.click(screen.getByLabelText('Ten'));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    await user.click(screen.getByRole('button', {name: 'Check answer'}));
    expect(screen.getByRole('status')).toHaveTextContent('Correct. Eight plus two is ten.');
    await user.click(screen.getByRole('button', {name: 'Reset'}));
    expect(screen.getByRole('button', {name: 'Check answer'})).toBeDisabled();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('keeps multiple questions independent and supports arrow-key selection', async () => {
    const user = userEvent.setup();
    render(<><SelfCheck {...props} /><SelfCheck {...props} question="Second question" /></>);
    const groups = screen.getAllByRole('group');
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(within(groups[0]).getByLabelText('Ten')).toBeChecked();
    expect(within(groups[1]).getByLabelText('Ten')).not.toBeChecked();
  });
});

it('renders resource links, objectives, and callout content accessibly', () => {
  render(<>
    <ResourceCard title="Reading" href="/docs/unit-1/" label="Unit 1">Start here.</ResourceCard>
    <LearningObjectives items={['Explain a bit.', 'Represent a number.']} />
    <InstructionalCallout tone="tip" title="Think first">Predict the total.</InstructionalCallout>
  </>);
  expect(screen.getByRole('link', {name: 'Reading'})).toHaveAttribute('href', '/docs/unit-1/');
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.getByRole('complementary')).toHaveTextContent('Think first');
  expect(screen.getByRole('complementary')).toHaveTextContent('Predict the total.');
});
