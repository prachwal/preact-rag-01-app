import type { ComponentChildren } from 'preact';
import './Grid.scss';

interface GridProps {
  children: ComponentChildren;
  columns?: number | 'auto-fit' | 'auto-fill';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  minWidth?: string;
  className?: string;
}

interface GridItemProps {
  children: ComponentChildren;
  span?: number;
  className?: string;
}

/**
 * Grid component for flexible, responsive layouts
 * 
 * @component
 * @param {ComponentChildren} children - Grid content
 * @param {number | 'auto-fit' | 'auto-fill'} columns - Number of columns or auto sizing (default: 'auto-fit')
 * @param {'none' | 'sm' | 'md' | 'lg'} gap - Spacing between grid items (default: 'md')
 * @param {string} minWidth - Minimum width for auto columns (default: '200px')
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * // Auto-fit grid with medium gap
 * <Grid columns="auto-fit" gap="md" minWidth="250px">
 *   <GridItem><Card /></GridItem>
 *   <GridItem span={2}><Card /></GridItem>
 * </Grid>
 * 
 * // Fixed 3-column grid
 * <Grid columns={3} gap="lg">
 *   <GridItem>Item 1</GridItem>
 *   <GridItem>Item 2</GridItem>
 *   <GridItem>Item 3</GridItem>
 * </Grid>
 * ```
 */
export function Grid({ 
  children, 
  columns = 'auto-fit', 
  gap = 'md',
  minWidth = '200px',
  className = '' 
}: GridProps) {
  const gapClass = `grid--gap-${gap}`;
  const classes = ['grid', gapClass, className].filter(Boolean).join(' ');

  const style = typeof columns === 'number'
    ? { gridTemplateColumns: `repeat(${columns}, 1fr)` }
    : { gridTemplateColumns: `repeat(${columns}, minmax(${minWidth}, 1fr))` };

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}

/**
 * Grid Item component for individual grid items
 * 
 * @component
 * @param {ComponentChildren} children - Item content
 * @param {number} span - Number of columns to span
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * <GridItem span={2}>
 *   <Card title="Wide Card" />
 * </GridItem>
 * ```
 */
export function GridItem({ children, span, className = '' }: GridItemProps) {
  const classes = ['grid-item', className].filter(Boolean).join(' ');
  const style = span !== undefined && span > 0 ? { gridColumn: `span ${span}` } : undefined;

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
