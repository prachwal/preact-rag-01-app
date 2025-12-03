import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import { Grid, GridItem } from './Grid';

describe('Grid Component', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      const { getByText } = render(
        <Grid>
          <div>Grid Item</div>
        </Grid>
      );
      
      expect(getByText('Grid Item')).toBeTruthy();
    });

    it('should apply default grid class', () => {
      const { container } = render(
        <Grid>
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid');
      expect(gridDiv).toBeTruthy();
    });
  });

  describe('Columns', () => {
    it('should use auto-fit by default', () => {
      const { container } = render(
        <Grid>
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid') as HTMLElement;
      expect(gridDiv?.style.gridTemplateColumns).toContain('auto-fit');
    });

    it('should apply 1 column with style', () => {
      const { container } = render(
        <Grid columns={1}>
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid') as HTMLElement;
      expect(gridDiv?.style.gridTemplateColumns).toBe('repeat(1, 1fr)');
    });

    it('should apply 2 columns with style', () => {
      const { container } = render(
        <Grid columns={2}>
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid') as HTMLElement;
      expect(gridDiv?.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
    });

    it('should apply 3 columns with style', () => {
      const { container } = render(
        <Grid columns={3}>
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid') as HTMLElement;
      expect(gridDiv?.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    });

    it('should apply 4 columns with style', () => {
      const { container } = render(
        <Grid columns={4}>
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid') as HTMLElement;
      expect(gridDiv?.style.gridTemplateColumns).toBe('repeat(4, 1fr)');
    });

    it('should apply auto-fill columns with style', () => {
      const { container } = render(
        <Grid columns="auto-fill">
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid') as HTMLElement;
      expect(gridDiv?.style.gridTemplateColumns).toContain('auto-fill');
    });
  });

  describe('Gap', () => {
    it('should apply default gap', () => {
      const { container } = render(
        <Grid>
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid');
      expect(gridDiv?.classList.contains('grid--gap-md')).toBe(true);
    });

    it('should apply small gap', () => {
      const { container } = render(
        <Grid gap="sm">
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid');
      expect(gridDiv?.classList.contains('grid--gap-sm')).toBe(true);
    });

    it('should apply large gap', () => {
      const { container } = render(
        <Grid gap="lg">
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid');
      expect(gridDiv?.classList.contains('grid--gap-lg')).toBe(true);
    });

    it('should apply no gap', () => {
      const { container } = render(
        <Grid gap="none">
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid');
      expect(gridDiv?.classList.contains('grid--gap-none')).toBe(true);
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Grid className="custom-grid">
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid');
      expect(gridDiv?.classList.contains('custom-grid')).toBe(true);
    });

    it('should combine custom className with default classes', () => {
      const { container } = render(
        <Grid className="custom-grid" columns={3} gap="lg">
          <div>Content</div>
        </Grid>
      );
      
      const gridDiv = container.querySelector('.grid') as HTMLElement;
      expect(gridDiv?.classList.contains('grid')).toBe(true);
      expect(gridDiv?.classList.contains('grid--gap-lg')).toBe(true);
      expect(gridDiv?.classList.contains('custom-grid')).toBe(true);
      expect(gridDiv?.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple grid items', () => {
      const { getByText } = render(
        <Grid>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Grid>
      );
      
      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
      expect(getByText('Item 3')).toBeTruthy();
    });
  });
});

describe('GridItem Component', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      const { getByText } = render(
        <GridItem>
          <div>Grid Item Content</div>
        </GridItem>
      );
      
      expect(getByText('Grid Item Content')).toBeTruthy();
    });

    it('should apply default grid-item class', () => {
      const { container } = render(
        <GridItem>
          <div>Content</div>
        </GridItem>
      );
      
      const gridItemDiv = container.querySelector('.grid-item');
      expect(gridItemDiv).toBeTruthy();
    });
  });

  describe('Span', () => {
    it('should apply span-2 with style', () => {
      const { container } = render(
        <GridItem span={2}>
          <div>Content</div>
        </GridItem>
      );
      
      const gridItemDiv = container.querySelector('.grid-item') as HTMLElement;
      expect(gridItemDiv?.style.gridColumn).toBe('span 2');
    });

    it('should apply span-3 with style', () => {
      const { container } = render(
        <GridItem span={3}>
          <div>Content</div>
        </GridItem>
      );
      
      const gridItemDiv = container.querySelector('.grid-item') as HTMLElement;
      expect(gridItemDiv?.style.gridColumn).toBe('span 3');
    });

    it('should apply span-4 with style', () => {
      const { container } = render(
        <GridItem span={4}>
          <div>Content</div>
        </GridItem>
      );
      
      const gridItemDiv = container.querySelector('.grid-item') as HTMLElement;
      expect(gridItemDiv?.style.gridColumn).toBe('span 4');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <GridItem className="custom-item">
          <div>Content</div>
        </GridItem>
      );
      
      const gridItemDiv = container.querySelector('.grid-item');
      expect(gridItemDiv?.classList.contains('custom-item')).toBe(true);
    });

    it('should combine custom className with span style', () => {
      const { container } = render(
        <GridItem className="custom-item" span={2}>
          <div>Content</div>
        </GridItem>
      );
      
      const gridItemDiv = container.querySelector('.grid-item') as HTMLElement;
      expect(gridItemDiv?.classList.contains('grid-item')).toBe(true);
      expect(gridItemDiv?.classList.contains('custom-item')).toBe(true);
      expect(gridItemDiv?.style.gridColumn).toBe('span 2');
    });
  });
});
