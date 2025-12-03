/**
 * UserCard Component - Displays user information with actions
 * Shows user name, email, and ID above action buttons
 */

import type { ComponentChildren } from 'preact';
import { Card } from '../Card';
import './UserCard.scss';

export interface UserData {
  id: number | string;
  name: string;
  email: string;
}

export interface UserCardProps {
  user: UserData;
  actions?: ComponentChildren;
  className?: string;
}

export function UserCard({ user, actions, className = '' }: UserCardProps) {
  return (
    <Card variant="glass" className={`user-card ${className}`}>
      <div className="user-card__content">
        <div className="user-card__info">
          <h3 className="user-card__name">{user.name}</h3>
          <p className="user-card__email">{user.email}</p>
          <p className="user-card__id">ID: {user.id}</p>
        </div>

        {actions && (
          <div className="user-card__actions">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
}

export default UserCard;