/**
 * Card Component - Reusable container with glass morphism effect
 * Follows SOLID principles:
 * - Single Responsibility: Handles only card container rendering
 * - Open/Closed: Open for extension via variants
 */

import type { ComponentChildren } from 'preact';
import './Card.scss';

export interface CardProps {
  children: ComponentChildren;
  variant?: 'default' | 'glass' | 'elevated';
  className?: string;
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const cardClass = ['card', `card--${variant}`, className].filter(Boolean).join(' ');

  return <div class={cardClass}>{children}</div>;
}
