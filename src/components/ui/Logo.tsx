/**
 * Logo Component - Reusable logo image with lazy loading
 * Follows SOLID principles:
 * - Single Responsibility: Handles only logo image rendering
 */

import './Logo.scss';

export interface LogoProps {
  src: string;
  alt: string;
  variant?: 'default' | 'preact';
  className?: string;
}

export function Logo({ src, alt, variant = 'default', className = '' }: LogoProps) {
  const logoClass = ['logo', variant === 'preact' && 'logo--preact', className]
    .filter(Boolean)
    .join(' ');

  return <img src={src} alt={alt} class={logoClass} loading="lazy" />;
}
