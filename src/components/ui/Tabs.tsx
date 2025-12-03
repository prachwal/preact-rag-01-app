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
 * @component
 * @param {Tab[]} tabs - Array of tab configurations
 * @param {string} activeTab - ID of currently active tab
 * @param {(tabId: string) => void} onTabChange - Callback when tab is clicked
 * @param {'default' | 'compact' | 'pills'} variant - Visual style (default: 'default')
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * const [activeTab, setActiveTab] = useState('overview');
 * 
 * const tabs = [
 *   { id: 'overview', label: 'Overview', icon: '📊' },
 *   { id: 'settings', label: 'Settings', icon: '⚙️' },
 *   { id: 'help', label: 'Help', disabled: true }
 * ];
 * 
 * <Tabs 
 *   tabs={tabs} 
 *   activeTab={activeTab} 
 *   onTabChange={setActiveTab}
 *   variant="pills"
 * />
 * 
 * <TabPanel tabId="overview" activeTab={activeTab}>
 *   <OverviewContent />
 * </TabPanel>
 * <TabPanel tabId="settings" activeTab={activeTab}>
 *   <SettingsContent />
 * </TabPanel>
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
          disabled={tab.disabled ?? false}
          onClick={() => !(tab.disabled ?? false) && onTabChange(tab.id)}
          className={[
            'tabs__tab',
            activeTab === tab.id && 'tabs__tab--active',
            (tab.disabled ?? false) && 'tabs__tab--disabled'
          ].filter(Boolean).join(' ')}
        >
          {tab.icon !== undefined && tab.icon !== '' && (
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
 * 
 * @component
 * @param {ComponentChildren} children - Panel content
 * @param {string} tabId - ID matching the tab that controls this panel
 * @param {string} activeTab - ID of currently active tab
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * <TabPanel tabId="profile" activeTab={activeTab}>
 *   <UserProfile />
 * </TabPanel>
 * ```
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
