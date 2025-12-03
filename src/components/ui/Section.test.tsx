import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import { Section } from './Section';

describe('Section Component', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      const { getByText } = render(
        <Section>
          <div>Test Content</div>
        </Section>
      );
      
      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should apply default variant class', () => {
      const { container } = render(
        <Section>
          <div>Content</div>
        </Section>
      );
      
      const sectionDiv = container.querySelector('.section');
      expect(sectionDiv).toBeTruthy();
      expect(sectionDiv?.classList.contains('section--default')).toBe(true);
    });

    it('should render as section element by default', () => {
      const { container } = render(
        <Section>
          <div>Content</div>
        </Section>
      );
      
      const sectionElement = container.querySelector('section');
      expect(sectionElement).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('should apply default variant class', () => {
      const { container } = render(
        <Section variant="default">
          <div>Content</div>
        </Section>
      );
      
      const sectionDiv = container.querySelector('.section');
      expect(sectionDiv?.classList.contains('section--default')).toBe(true);
    });

    it('should apply glass variant class', () => {
      const { container } = render(
        <Section variant="glass">
          <div>Content</div>
        </Section>
      );
      
      const sectionDiv = container.querySelector('.section');
      expect(sectionDiv?.classList.contains('section--glass')).toBe(true);
    });

    it('should apply elevated variant class', () => {
      const { container } = render(
        <Section variant="elevated">
          <div>Content</div>
        </Section>
      );
      
      const sectionDiv = container.querySelector('.section');
      expect(sectionDiv?.classList.contains('section--elevated')).toBe(true);
    });

    it('should apply dark variant class', () => {
      const { container } = render(
        <Section variant="dark">
          <div>Content</div>
        </Section>
      );
      
      const sectionDiv = container.querySelector('.section');
      expect(sectionDiv?.classList.contains('section--dark')).toBe(true);
    });
  });

  describe('Spacing', () => {
    it('should apply default spacing', () => {
      const { container } = render(
        <Section>
          <div>Content</div>
        </Section>
      );
      
      const sectionDiv = container.querySelector('.section');
      expect(sectionDiv?.classList.contains('section--spacing-md')).toBe(true);
    });

    it('should apply small spacing', () => {
      const { container } = render(
        <Section spacing="sm">
          <div>Content</div>
        </Section>
      );
      
      const sectionDiv = container.querySelector('.section');
      expect(sectionDiv?.classList.contains('section--spacing-sm')).toBe(true);
    });

    it('should apply large spacing', () => {
      const { container } = render(
        <Section spacing="lg">
          <div>Content</div>
        </Section>
      );
      
      const sectionDiv = container.querySelector('.section');
      expect(sectionDiv?.classList.contains('section--spacing-lg')).toBe(true);
    });


  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Section className="custom-section">
          <div>Content</div>
        </Section>
      );
      
      const sectionDiv = container.querySelector('.section');
      expect(sectionDiv?.classList.contains('custom-section')).toBe(true);
    });

    it('should combine custom className with default classes', () => {
      const { container } = render(
        <Section className="custom-section" variant="glass" spacing="lg">
          <div>Content</div>
        </Section>
      );
      
      const sectionDiv = container.querySelector('.section');
      expect(sectionDiv?.classList.contains('section')).toBe(true);
      expect(sectionDiv?.classList.contains('section--glass')).toBe(true);
      expect(sectionDiv?.classList.contains('section--spacing-lg')).toBe(true);
      expect(sectionDiv?.classList.contains('custom-section')).toBe(true);
    });
  });

  describe('ARIA support', () => {
    it('should apply aria-labelledby when provided', () => {
      const { container } = render(
        <Section ariaLabelledby="section-title">
          <div>Content</div>
        </Section>
      );
      
      const sectionElement = container.querySelector('section');
      expect(sectionElement?.getAttribute('aria-labelledby')).toBe('section-title');
    });

    it('should not have aria-labelledby when not provided', () => {
      const { container } = render(
        <Section>
          <div>Content</div>
        </Section>
      );
      
      const sectionElement = container.querySelector('section');
      expect(sectionElement?.hasAttribute('aria-labelledby')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple children', () => {
      const { getByText } = render(
        <Section>
          <h2>Title</h2>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </Section>
      );
      
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Paragraph 1')).toBeTruthy();
      expect(getByText('Paragraph 2')).toBeTruthy();
    });

    it('should handle nested sections', () => {
      const { getByText } = render(
        <Section variant="elevated">
          <Section variant="glass">
            <div>Nested Content</div>
          </Section>
        </Section>
      );
      
      expect(getByText('Nested Content')).toBeTruthy();
    });
  });
});
