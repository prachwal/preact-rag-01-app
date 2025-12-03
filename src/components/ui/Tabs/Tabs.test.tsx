import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { Tabs, TabPanel } from './Tabs';

describe('Tabs Component', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3' }
  ];

  describe('Rendering', () => {
    it('should render all tabs', () => {
      const { getByText } = render(
        <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />
      );
      
      expect(getByText('Tab 1')).toBeTruthy();
      expect(getByText('Tab 2')).toBeTruthy();
      expect(getByText('Tab 3')).toBeTruthy();
    });

    it('should apply active class to active tab', () => {
      const { container } = render(
        <Tabs tabs={mockTabs} activeTab="tab2" onTabChange={() => {}} />
      );
      
      const buttons = container.querySelectorAll('.tabs__tab');
      expect(buttons[1].classList.contains('tabs__tab--active')).toBe(true);
    });

    it('should render with default variant', () => {
      const { container } = render(
        <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />
      );
      
      const tabsDiv = container.querySelector('.tabs');
      expect(tabsDiv?.classList.contains('tabs--default')).toBe(true);
    });
  });

  describe('Variants', () => {
    it('should apply default variant class', () => {
      const { container } = render(
        <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} variant="default" />
      );
      
      const tabsDiv = container.querySelector('.tabs');
      expect(tabsDiv?.classList.contains('tabs--default')).toBe(true);
    });

    it('should apply compact variant class', () => {
      const { container } = render(
        <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} variant="compact" />
      );
      
      const tabsDiv = container.querySelector('.tabs');
      expect(tabsDiv?.classList.contains('tabs--compact')).toBe(true);
    });

    it('should apply pills variant class', () => {
      const { container } = render(
        <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} variant="pills" />
      );
      
      const tabsDiv = container.querySelector('.tabs');
      expect(tabsDiv?.classList.contains('tabs--pills')).toBe(true);
    });
  });

  describe('Tab interactions', () => {
    it('should call onTabChange when tab is clicked', () => {
      const handleTabChange = vi.fn();
      const { getByText } = render(
        <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={handleTabChange} />
      );
      
      fireEvent.click(getByText('Tab 2'));
      expect(handleTabChange).toHaveBeenCalledWith('tab2');
    });

    it('should call onTabChange even when active tab is clicked', () => {
      const handleTabChange = vi.fn();
      const { getByText } = render(
        <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={handleTabChange} />
      );
      
      fireEvent.click(getByText('Tab 1'));
      // The implementation allows clicking active tab
      expect(handleTabChange).toHaveBeenCalledWith('tab1');
    });

    it('should not call onTabChange when disabled tab is clicked', () => {
      const handleTabChange = vi.fn();
      const disabledTabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2', disabled: true }
      ];
      const { getByText } = render(
        <Tabs tabs={disabledTabs} activeTab="tab1" onTabChange={handleTabChange} />
      );
      
      fireEvent.click(getByText('Tab 2'));
      expect(handleTabChange).not.toHaveBeenCalled();
    });
  });

  describe('Disabled state', () => {
    it('should apply disabled class to disabled tab', () => {
      const disabledTabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2', disabled: true }
      ];
      const { container } = render(
        <Tabs tabs={disabledTabs} activeTab="tab1" onTabChange={() => {}} />
      );
      
      const buttons = container.querySelectorAll('.tabs__tab');
      expect(buttons[1].classList.contains('tabs__tab--disabled')).toBe(true);
    });

    it('should set disabled attribute on disabled tab button', () => {
      const disabledTabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2', disabled: true }
      ];
      const { container } = render(
        <Tabs tabs={disabledTabs} activeTab="tab1" onTabChange={() => {}} />
      );
      
      const buttons = container.querySelectorAll('.tabs__tab');
      expect(buttons[1].hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Icons', () => {
    it('should render icon when provided', () => {
      const tabsWithIcons = [
        { id: 'tab1', label: 'Tab 1', icon: '🏠' }
      ];
      const { getByText } = render(
        <Tabs tabs={tabsWithIcons} activeTab="tab1" onTabChange={() => {}} />
      );
      
      expect(getByText('🏠')).toBeTruthy();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} className="custom-tabs" />
      );
      
      const tabsDiv = container.querySelector('.tabs');
      expect(tabsDiv?.classList.contains('custom-tabs')).toBe(true);
    });
  });

  describe('ARIA attributes', () => {
    it('should have correct role attributes', () => {
      const { container } = render(
        <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />
      );
      
      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toBeTruthy();
    });

    it('should have correct aria-selected on active tab', () => {
      const { container } = render(
        <Tabs tabs={mockTabs} activeTab="tab2" onTabChange={() => {}} />
      );
      
      const buttons = container.querySelectorAll('[role="tab"]');
      expect(buttons[1].getAttribute('aria-selected')).toBe('true');
      expect(buttons[0].getAttribute('aria-selected')).toBe('false');
    });
  });
});

describe('TabPanel Component', () => {
  describe('Rendering', () => {
    it('should render children when active', () => {
      const { getByText } = render(
        <TabPanel tabId="tab1" activeTab="tab1">
          <div>Panel Content</div>
        </TabPanel>
      );
      
      expect(getByText('Panel Content')).toBeTruthy();
    });

    it('should not render children when inactive', () => {
      const { container } = render(
        <TabPanel tabId="tab1" activeTab="tab2">
          <div>Panel Content</div>
        </TabPanel>
      );
      
      expect(container.textContent).toBe('');
    });

    it('should have correct role attribute', () => {
      const { container } = render(
        <TabPanel tabId="tab1" activeTab="tab1">
          <div>Panel Content</div>
        </TabPanel>
      );
      
      const panel = container.querySelector('[role="tabpanel"]');
      expect(panel).toBeTruthy();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className when active', () => {
      const { container } = render(
        <TabPanel tabId="tab1" activeTab="tab1" className="custom-panel">
          <div>Panel Content</div>
        </TabPanel>
      );
      
      const panel = container.querySelector('.tab-panel');
      expect(panel?.classList.contains('custom-panel')).toBe(true);
    });
  });
});
