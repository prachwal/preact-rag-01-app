import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import { StatusIndicator } from './StatusIndicator';

describe('StatusIndicator Component', () => {
  describe('Rendering', () => {
    it('should render with status', () => {
      const { container } = render(
        <StatusIndicator status="online" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      expect(indicator).toBeTruthy();
    });

    it('should render default label', () => {
      const { getByText } = render(
        <StatusIndicator status="online" />
      );
      
      expect(getByText('Online')).toBeTruthy();
    });

    it('should render custom label', () => {
      const { getByText } = render(
        <StatusIndicator status="online" label="All Systems Operational" />
      );
      
      expect(getByText('All Systems Operational')).toBeTruthy();
    });
  });

  describe('Status types', () => {
    it('should apply online status class', () => {
      const { container } = render(
        <StatusIndicator status="online" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      expect(indicator?.classList.contains('status-indicator--online')).toBe(true);
    });

    it('should apply offline status class', () => {
      const { container } = render(
        <StatusIndicator status="offline" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      expect(indicator?.classList.contains('status-indicator--offline')).toBe(true);
    });

    it('should apply warning status class', () => {
      const { container } = render(
        <StatusIndicator status="warning" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      expect(indicator?.classList.contains('status-indicator--warning')).toBe(true);
    });

    it('should apply error status class', () => {
      const { container } = render(
        <StatusIndicator status="error" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      expect(indicator?.classList.contains('status-indicator--error')).toBe(true);
    });

    it('should apply loading status class', () => {
      const { container } = render(
        <StatusIndicator status="loading" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      expect(indicator?.classList.contains('status-indicator--loading')).toBe(true);
    });
  });

  describe('Default labels', () => {
    it('should show "Online" label for online status', () => {
      const { getByText } = render(
        <StatusIndicator status="online" />
      );
      
      expect(getByText('Online')).toBeTruthy();
    });

    it('should show "Offline" label for offline status', () => {
      const { getByText } = render(
        <StatusIndicator status="offline" />
      );
      
      expect(getByText('Offline')).toBeTruthy();
    });

    it('should show "Warning" label for warning status', () => {
      const { getByText } = render(
        <StatusIndicator status="warning" />
      );
      
      expect(getByText('Warning')).toBeTruthy();
    });

    it('should show "Error" label for error status', () => {
      const { getByText } = render(
        <StatusIndicator status="error" />
      );
      
      expect(getByText('Error')).toBeTruthy();
    });

    it('should show "Loading..." label for loading status', () => {
      const { getByText } = render(
        <StatusIndicator status="loading" />
      );
      
      expect(getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <StatusIndicator status="online" className="custom-indicator" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      expect(indicator?.classList.contains('custom-indicator')).toBe(true);
    });

    it('should combine custom className with status class', () => {
      const { container } = render(
        <StatusIndicator status="warning" className="custom-indicator" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      expect(indicator?.classList.contains('status-indicator')).toBe(true);
      expect(indicator?.classList.contains('status-indicator--warning')).toBe(true);
      expect(indicator?.classList.contains('custom-indicator')).toBe(true);
    });
  });

  describe('Structure', () => {
    it('should have dot and label elements by default', () => {
      const { container } = render(
        <StatusIndicator status="online" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      const dot = indicator?.querySelector('.status-indicator__dot');
      const label = indicator?.querySelector('.status-indicator__label');
      
      expect(indicator).toBeTruthy();
      expect(dot).toBeTruthy();
      expect(label).toBeTruthy();
    });

    it('should hide dot when showDot is false', () => {
      const { container } = render(
        <StatusIndicator status="online" showDot={false} />
      );
      
      const dot = container.querySelector('.status-indicator__dot');
      expect(dot).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      const { container } = render(
        <StatusIndicator status="online" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      expect(indicator?.getAttribute('role')).toBe('status');
    });

    it('should have aria-live attribute', () => {
      const { container } = render(
        <StatusIndicator status="online" />
      );
      
      const indicator = container.querySelector('.status-indicator');
      expect(indicator?.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long custom labels', () => {
      const longLabel = 'This is a very long status label that contains a lot of information';
      const { getByText } = render(
        <StatusIndicator status="online" label={longLabel} />
      );
      
      expect(getByText(longLabel)).toBeTruthy();
    });

    it('should handle empty string label', () => {
      const { container } = render(
        <StatusIndicator status="online" label="" />
      );
      
      const label = container.querySelector('.status-indicator__label');
      expect(label?.textContent).toBe('');
    });
  });
});
