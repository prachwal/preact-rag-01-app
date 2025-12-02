import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { App } from './app';

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /preact.*rag.*app/i });
    expect(heading).toBeTruthy();
  });

  it('renders count value initially as 0', () => {
    render(<App />);
    const countText = screen.getByText(/count is 0/i);
    expect(countText).toBeTruthy();
  });

  it('increments count when button is clicked', async () => {
    render(<App />);

    const button = screen.getByRole('button', { name: /count is/i });

    // Initial count
    const initialCount = screen.getByText(/count is 0/i);
    expect(initialCount).toBeTruthy();

    // Click the button
    button.click();

    // Wait for state update
    await new Promise(resolve => setTimeout(resolve, 0));

    // Check updated count
    const updatedCount = screen.getByText(/count is 1/i);
    expect(updatedCount).toBeTruthy();
  });
});
