import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import ActiveLessonNavigation from '../src/components/ActiveLessonNavigation';

const href = '/CSP_LearningResources/docs/unit-6/hermantown-data-center-case-study/';
const headings = [
  {id: 'how-the-jigsaw-works', value: 'How the jigsaw works', level: 2},
  {id: 'shared-doc', value: 'Shared <em>Google Doc</em>', level: 3},
];

describe('active lesson sections', () => {
  it('starts expanded and links to the active lesson with its base path and heading anchors', () => {
    render(<ActiveLessonNavigation href={href} headings={headings} />);
    expect(screen.getByRole('button', {name: 'On this page'})).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', {name: 'How the jigsaw works'})).toHaveAttribute('href', `${href}#how-the-jigsaw-works`);
    expect(screen.getByRole('link', {name: 'Shared Google Doc'})).toHaveAttribute('href', `${href}#shared-doc`);
  });

  it('supports keyboard collapse and expansion with a labeled controlled list', async () => {
    const user = userEvent.setup();
    render(<ActiveLessonNavigation href={href} headings={headings} />);
    const toggle = screen.getByRole('button', {name: 'On this page'});
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(document.getElementById(toggle.getAttribute('aria-controls')!)).not.toBeVisible();
    await user.keyboard(' ');
    expect(screen.getByRole('link', {name: 'How the jigsaw works'})).toBeVisible();
  });

  it('notifies the sidebar when navigating so the mobile drawer can close', async () => {
    const onNavigate = vi.fn();
    render(<ActiveLessonNavigation href={href} headings={headings} onNavigate={onNavigate} />);
    window.history.replaceState({}, '', href);
    await userEvent.setup().click(screen.getByRole('link', {name: 'Shared Google Doc'}));
    expect(onNavigate).toHaveBeenCalledOnce();
    window.history.replaceState({}, '', '/');
  });

  it('does not show an empty disclosure for pages without sections', () => {
    render(<ActiveLessonNavigation href={href} headings={[]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
