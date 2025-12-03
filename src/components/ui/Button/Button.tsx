/**
 * Button Component - Reusable button with multiple variants
 * Follows SOLID principles:
 * - Single Responsibility: Handles only button rendering
 * - Open/Closed: Open for extension via variants
 * - Interface Segregation: Clear props interface
 */

import type { ComponentChildren } from 'preact';
import './Button.scss';

export interface ButtonProps {
  children: ComponentChildren;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const buttonClass = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} class={buttonClass} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
