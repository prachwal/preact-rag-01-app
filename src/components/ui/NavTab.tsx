/**
 * NavTab Component - Navigation tab button
 * Follows SOLID principles:
 * - Single Responsibility: Handles only tab navigation button
 * - Interface Segregation: Clear and minimal props interface
 */

import './NavTab.scss';

export interface NavTabProps {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
  className?: string;
}

export function NavTab({ active, icon, label, onClick, className = '' }: NavTabProps) {
  const tabClass = ['nav-tab', active && 'nav-tab--active', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" class={tabClass} onClick={onClick} aria-selected={active}>
      <span class="nav-tab__icon" role="img" aria-label={icon}>
        {icon}
      </span>
      <span class="nav-tab__label">{label}</span>
    </button>
  );
}
