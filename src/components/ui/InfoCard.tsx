import type { ComponentChildren } from 'preact';
import './InfoCard.scss';

interface InfoCardProps {
  title: string;
  children: ComponentChildren;
  icon?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  hoverable?: boolean;
  className?: string;
}

/**
 * InfoCard component for displaying information in a card format
 * 
 * @component
 * @param {string} title - Card title
 * @param {ComponentChildren} children - Card content/value
 * @param {string} icon - Optional emoji or icon character
 * @param {'default' | 'primary' | 'success' | 'warning' | 'danger'} variant - Visual style (default: 'default')
 * @param {boolean} hoverable - Enable hover effect (default: true)
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * // Success card with icon
 * <InfoCard title="Server Status" icon="✓" variant="success">
 *   <span>Online</span>
 * </InfoCard>
 * 
 * // Stats card
 * <InfoCard title="Total Users" variant="primary">
 *   <div className="stat-value">1,234</div>
 * </InfoCard>
 * 
 * // Warning card without hover
 * <InfoCard title="Disk Space" icon="⚠" variant="warning" hoverable={false}>
 *   <span>85% used</span>
 * </InfoCard>
 * ```
 */
export function InfoCard({ 
  title, 
  children, 
  icon,
  variant = 'default',
  hoverable = true,
  className = '' 
}: InfoCardProps) {
  const classes = [
    'info-card',
    `info-card--${variant}`,
    hoverable && 'info-card--hoverable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {icon !== undefined && icon !== '' && (
        <div className="info-card__icon" role="img" aria-label={icon}>
          {icon}
        </div>
      )}
      <h4 className="info-card__title">{title}</h4>
      <div className="info-card__content">
        {children}
      </div>
    </div>
  );
}
