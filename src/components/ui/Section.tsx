import type { ComponentChildren } from 'preact';
import './Section.scss';

interface SectionProps {
  children: ComponentChildren;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'dark';
  spacing?: 'sm' | 'md' | 'lg';
  ariaLabelledby?: string;
}

/**
 * Reusable section component with different visual variants
 * 
 * @example
 * ```tsx
 * <Section variant="glass" spacing="lg">
 *   <h2>Section Title</h2>
 * </Section>
 * ```
 */
export function Section({ 
  children, 
  className = '', 
  variant = 'default',
  spacing = 'md',
  ariaLabelledby
}: SectionProps) {
  const classes = [
    'section',
    `section--${variant}`,
    `section--spacing-${spacing}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={classes} aria-labelledby={ariaLabelledby}>
      {children}
    </section>
  );
}
