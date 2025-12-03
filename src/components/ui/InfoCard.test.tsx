import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import { InfoCard } from './InfoCard';

describe('InfoCard Component', () => {
  describe('Rendering', () => {
    it('should render title and content', () => {
      const { getByText } = render(
        <InfoCard title="Total Users">
          <span>1,234</span>
        </InfoCard>
      );
      
      expect(getByText('Total Users')).toBeTruthy();
      expect(getByText('1,234')).toBeTruthy();
    });

    it('should apply default variant class', () => {
      const { container } = render(
        <InfoCard title="Test">
          <span>100</span>
        </InfoCard>
      );
      
      const cardDiv = container.querySelector('.info-card');
      expect(cardDiv).toBeTruthy();
      expect(cardDiv?.classList.contains('info-card--default')).toBe(true);
    });
  });

  describe('Variants', () => {
    it('should apply default variant class', () => {
      const { container } = render(
        <InfoCard title="Test" variant="default">
          <span>100</span>
        </InfoCard>
      );
      
      const cardDiv = container.querySelector('.info-card');
      expect(cardDiv?.classList.contains('info-card--default')).toBe(true);
    });

    it('should apply primary variant class', () => {
      const { container } = render(
        <InfoCard title="Test" variant="primary">
          <span>100</span>
        </InfoCard>
      );
      
      const cardDiv = container.querySelector('.info-card');
      expect(cardDiv?.classList.contains('info-card--primary')).toBe(true);
    });

    it('should apply success variant class', () => {
      const { container } = render(
        <InfoCard title="Test" variant="success">
          <span>100</span>
        </InfoCard>
      );
      
      const cardDiv = container.querySelector('.info-card');
      expect(cardDiv?.classList.contains('info-card--success')).toBe(true);
    });

    it('should apply warning variant class', () => {
      const { container } = render(
        <InfoCard title="Test" variant="warning">
          <span>100</span>
        </InfoCard>
      );
      
      const cardDiv = container.querySelector('.info-card');
      expect(cardDiv?.classList.contains('info-card--warning')).toBe(true);
    });

    it('should apply danger variant class', () => {
      const { container } = render(
        <InfoCard title="Test" variant="danger">
          <span>100</span>
        </InfoCard>
      );
      
      const cardDiv = container.querySelector('.info-card');
      expect(cardDiv?.classList.contains('info-card--danger')).toBe(true);
    });
  });

  describe('Icon', () => {
    it('should render icon when provided', () => {
      const { getByText } = render(
        <InfoCard title="Test" icon="📊">
          <span>100</span>
        </InfoCard>
      );
      
      expect(getByText('📊')).toBeTruthy();
    });

    it('should not render icon section when icon is not provided', () => {
      const { container } = render(
        <InfoCard title="Test">
          <span>100</span>
        </InfoCard>
      );
      
      const iconDiv = container.querySelector('.info-card__icon');
      expect(iconDiv).toBeNull();
    });
  });

  describe('Hoverable', () => {
    it('should be hoverable by default', () => {
      const { container } = render(
        <InfoCard title="Test">
          <span>100</span>
        </InfoCard>
      );
      
      const cardDiv = container.querySelector('.info-card');
      expect(cardDiv?.classList.contains('info-card--hoverable')).toBe(true);
    });

    it('should not be hoverable when hoverable is false', () => {
      const { container } = render(
        <InfoCard title="Test" hoverable={false}>
          <span>100</span>
        </InfoCard>
      );
      
      const cardDiv = container.querySelector('.info-card');
      expect(cardDiv?.classList.contains('info-card--hoverable')).toBe(false);
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <InfoCard title="Test" className="custom-card">
          <span>100</span>
        </InfoCard>
      );
      
      const cardDiv = container.querySelector('.info-card');
      expect(cardDiv?.classList.contains('custom-card')).toBe(true);
    });

    it('should combine custom className with variant class', () => {
      const { container } = render(
        <InfoCard title="Test" className="custom-card" variant="success">
          <span>100</span>
        </InfoCard>
      );
      
      const cardDiv = container.querySelector('.info-card');
      expect(cardDiv?.classList.contains('info-card')).toBe(true);
      expect(cardDiv?.classList.contains('info-card--success')).toBe(true);
      expect(cardDiv?.classList.contains('custom-card')).toBe(true);
    });
  });

  describe('Structure', () => {
    it('should have correct HTML structure', () => {
      const { container } = render(
        <InfoCard title="Test" icon="📊">
          <span>100</span>
        </InfoCard>
      );
      
      const card = container.querySelector('.info-card');
      const icon = card?.querySelector('.info-card__icon');
      const title = card?.querySelector('.info-card__title');
      const content = card?.querySelector('.info-card__content');
      
      expect(card).toBeTruthy();
      expect(icon).toBeTruthy();
      expect(title).toBeTruthy();
      expect(content).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle long content', () => {
      const { getByText } = render(
        <InfoCard title="Test">
          <span>123,456,789</span>
        </InfoCard>
      );
      
      expect(getByText('123,456,789')).toBeTruthy();
    });

    it('should handle complex children', () => {
      const { getByText } = render(
        <InfoCard title="Test">
          <div>
            <p>Line 1</p>
            <p>Line 2</p>
          </div>
        </InfoCard>
      );
      
      expect(getByText('Line 1')).toBeTruthy();
      expect(getByText('Line 2')).toBeTruthy();
    });
  });
});
