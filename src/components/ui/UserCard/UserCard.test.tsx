/**
 * UserCard Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { UserCard } from './UserCard';

describe('UserCard Component', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('should render user information correctly', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('ID: 1')).toBeInTheDocument();
  });

  it('should render actions when provided', () => {
    const actions = <button>Edit</button>;
    render(<UserCard user={mockUser} actions={actions} />);

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<UserCard user={mockUser} className="custom-class" />);

    expect(container.firstChild).toHaveClass('user-card', 'custom-class');
  });

  it('should handle string ID', () => {
    const userWithStringId = { ...mockUser, id: 'user-123' };
    render(<UserCard user={userWithStringId} />);

    expect(screen.getByText('ID: user-123')).toBeInTheDocument();
  });

  it('should have correct structure', () => {
    const { container } = render(<UserCard user={mockUser} />);

    // Should contain the card wrapper
    const cardElement = container.querySelector('.card');
    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveClass('card--glass');

    // Should have user-card class
    const userCardElement = container.querySelector('.user-card');
    expect(userCardElement).toBeInTheDocument();
  });
});