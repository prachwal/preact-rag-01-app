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
 * @component
 * @param {ComponentChildren} children - Section content
 * @param {'default' | 'glass' | 'elevated' | 'dark'} variant - Visual style (default: 'default')
 * @param {'sm' | 'md' | 'lg'} spacing - Internal padding (default: 'md')
 * @param {string} ariaLabelledby - ID of element that labels this section
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * // Glass effect section
 * <Section variant="glass" spacing="lg">
 *   <h2>Featured Content</h2>
 *   <p>Beautiful glass effect</p>
 * </Section>
 * 
 * // Dark section with custom spacing
 * <Section variant="dark" spacing="sm" ariaLabelledby="about-heading">
 *   <h2 id="about-heading">About Us</h2>
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
