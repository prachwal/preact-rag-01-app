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
 * @example
 * ```tsx
 * <InfoCard title="Status" icon="✓" variant="success">
 *   <span>Online</span>
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
