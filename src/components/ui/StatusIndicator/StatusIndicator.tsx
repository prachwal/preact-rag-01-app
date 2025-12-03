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
 * @component
 * @param {'online' | 'offline' | 'warning' | 'error' | 'loading'} status - Current status
 * @param {string} label - Custom label (defaults to status name)
 * @param {boolean} showDot - Show animated status dot (default: true)
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * // Online status with default label
 * <StatusIndicator status="online" />
 * 
 * // Custom label
 * <StatusIndicator status="online" label="All Systems Operational" />
 * 
 * // Loading without dot
 * <StatusIndicator status="loading" label="Processing..." showDot={false} />
 * 
 * // Error state
 * <StatusIndicator status="error" label="Connection Failed" />
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
