import type { ComponentChildren } from 'preact';
import './Tabs.scss';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'compact' | 'pills';
  className?: string;
}

interface TabPanelProps {
  children: ComponentChildren;
  tabId: string;
  activeTab: string;
  className?: string;
}

/**
 * Tabs component for tabbed navigation
 * 
 * @example
 * ```tsx
 * const tabs = [
 *   { id: 'tab1', label: 'First Tab', icon: '🎯' },
 *   { id: 'tab2', label: 'Second Tab' }
 * ];
 * 
 * <Tabs 
 *   tabs={tabs} 
 *   activeTab={activeTab} 
 *   onTabChange={setActiveTab}
 * />
 * ```
 */
export function Tabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'default',
  className = '' 
}: TabsProps) {
  const containerClass = [
    'tabs',
    `tabs--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          disabled={tab.disabled}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          className={[
            'tabs__tab',
            activeTab === tab.id && 'tabs__tab--active',
            tab.disabled && 'tabs__tab--disabled'
          ].filter(Boolean).join(' ')}
        >
          {tab.icon && (
            <span className="tabs__icon" role="img" aria-label={tab.icon}>
              {tab.icon}
            </span>
          )}
          <span className="tabs__label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Tab Panel component to wrap tab content
 */
export function TabPanel({ children, tabId, activeTab, className = '' }: TabPanelProps) {
  const isActive = tabId === activeTab;

  if (!isActive) return null;

  return (
    <div
      id={`panel-${tabId}`}
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
      className={`tab-panel ${className}`}
    >
      {children}
    </div>
  );
}
