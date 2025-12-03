import type { ComponentChildren } from 'preact';
import './Grid.scss';

interface GridProps {
  children: ComponentChildren;
  columns?: number | 'auto-fit' | 'auto-fill';
  gap?: 'sm' | 'md' | 'lg';
  minWidth?: string;
  className?: string;
}

interface GridItemProps {
  children: ComponentChildren;
  span?: number;
  className?: string;
}

/**
 * Grid component for flexible layouts
 * 
 * @example
 * ```tsx
 * <Grid columns="auto-fit" gap="md" minWidth="250px">
 *   <GridItem><Card /></GridItem>
 *   <GridItem span={2}><Card /></GridItem>
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
