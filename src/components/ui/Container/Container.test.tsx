import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import { Container } from './Container';

describe('Container Component', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      const { getByText } = render(
        <Container>
          <div>Test Content</div>
        </Container>
      );
      
      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should apply default classes', () => {
      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toBeTruthy();
      expect(containerDiv?.classList.contains('container--lg')).toBe(true);
      expect(containerDiv?.classList.contains('container--centered')).toBe(true);
    });
  });

  describe('Size variants', () => {
    it('should apply small size class', () => {
      const { container } = render(
        <Container size="sm">
          <div>Content</div>
        </Container>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv?.classList.contains('container--sm')).toBe(true);
    });

    it('should apply medium size class', () => {
      const { container } = render(
        <Container size="md">
          <div>Content</div>
        </Container>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv?.classList.contains('container--md')).toBe(true);
    });

    it('should apply large size class', () => {
      const { container } = render(
        <Container size="lg">
          <div>Content</div>
        </Container>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv?.classList.contains('container--lg')).toBe(true);
    });

    it('should apply xl size class', () => {
      const { container } = render(
        <Container size="xl">
          <div>Content</div>
        </Container>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv?.classList.contains('container--xl')).toBe(true);
    });

    it('should apply full size class', () => {
      const { container } = render(
        <Container size="full">
          <div>Content</div>
        </Container>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv?.classList.contains('container--full')).toBe(true);
    });
  });

  describe('Centering', () => {
    it('should be centered by default', () => {
      const { container } = render(
        <Container>
          <div>Content</div>
        </Container>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv?.classList.contains('container--centered')).toBe(true);
    });

    it('should not be centered when centered is false', () => {
      const { container } = render(
        <Container centered={false}>
          <div>Content</div>
        </Container>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv?.classList.contains('container--centered')).toBe(false);
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Container className="custom-class">
          <div>Content</div>
        </Container>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv?.classList.contains('custom-class')).toBe(true);
    });

    it('should combine custom className with default classes', () => {
      const { container } = render(
        <Container className="custom-class" size="md">
          <div>Content</div>
        </Container>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv?.classList.contains('container')).toBe(true);
      expect(containerDiv?.classList.contains('container--md')).toBe(true);
      expect(containerDiv?.classList.contains('custom-class')).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple children', () => {
      const { getByText } = render(
        <Container>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </Container>
      );
      
      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
      expect(getByText('Third')).toBeTruthy();
    });

    it('should handle nested components', () => {
      const { getByText } = render(
        <Container>
          <Container size="sm">
            <div>Nested Content</div>
          </Container>
        </Container>
      );
      
      expect(getByText('Nested Content')).toBeTruthy();
    });
  });
});
