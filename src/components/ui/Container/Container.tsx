import type { ComponentChildren } from 'preact';
import './Container.scss';

interface ContainerProps {
  children: ComponentChildren;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
}

/**
 * Container component for centering and constraining content width
 * 
 * @component
 * @param {ComponentChildren} children - Container content
 * @param {'sm' | 'md' | 'lg' | 'xl' | 'full'} size - Maximum width (default: 'lg')
 * @param {boolean} centered - Center horizontally with auto margins (default: true)
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * // Large centered container
 * <Container size="lg">
 *   <h1>Page Title</h1>
 *   <p>Content goes here</p>
 * </Container>
 * 
 * // Full-width container
 * <Container size="full" centered={false}>
 *   <HeroSection />
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
