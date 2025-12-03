import type { ComponentChildren } from 'preact';
import './Container.scss';

interface ContainerProps {
  children: ComponentChildren;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
}

/**
 * Container component for centering and max-width content
 * 
 * @example
 * ```tsx
 * <Container size="lg">
 *   <h1>Content</h1>
 * </Container>
 * ```
 */
export function Container({ 
  children, 
  className = '', 
  size = 'lg',
  centered = true 
}: ContainerProps) {
  const classes = [
    'container',
    `container--${size}`,
    centered && 'container--centered',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}
