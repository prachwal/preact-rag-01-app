import './StatusIndicator.scss';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error' | 'loading';
  label?: string;
  showDot?: boolean;
  className?: string;
}

/**
 * StatusIndicator component for showing status with visual feedback
 * 
 * @example
 * ```tsx
 * <StatusIndicator status="online" label="System Online" />
 * <StatusIndicator status="loading" showDot />
 * ```
 */
export function StatusIndicator({ 
  status, 
  label,
  showDot = true,
  className = '' 
}: StatusIndicatorProps) {
  const classes = [
    'status-indicator',
    `status-indicator--${status}`,
    className
  ].filter(Boolean).join(' ');

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    warning: 'Warning',
    error: 'Error',
    loading: 'Loading...'
  };

  const displayLabel = label ?? statusLabels[status];

  return (
    <div className={classes} role="status" aria-live="polite">
      {showDot && <span className="status-indicator__dot" aria-hidden="true" />}
      <span className="status-indicator__label">{displayLabel}</span>
    </div>
  );
}
