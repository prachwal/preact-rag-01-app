/**
 * Main API Dashboard component
 */

import { useState, useMemo } from 'preact/hooks';
import { UserList } from './UserList';
import { GreetingComponent } from './GreetingComponent';
import { 
  Section, 
  Tabs, 
  TabPanel, 
  Grid, 
  InfoCard, 
  StatusIndicator,
  type Tab
} from '../ui';

interface ApiDashboardProps {
  className?: string;
}

export function ApiDashboard({ className = '' }: ApiDashboardProps) {
  const [activeTab, setActiveTab] = useState('greeting');

  const tabs: Tab[] = useMemo(() => [
    { id: 'greeting', label: 'Greeting & Health', icon: '👋' },
    { id: 'users', label: 'Users Management', icon: '👥' },
  ], []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <Section variant="glass" spacing="lg" className={`api-dashboard ${className}`}>
      <div className="api-dashboard__header">
        <h1>API Dashboard</h1>
        <p className="api-dashboard__subtitle">
          Test and manage all available API endpoints
        </p>
      </div>

      <Tabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="compact"
      />

      <div className="api-dashboard__content">
        <TabPanel tabId="greeting" activeTab={activeTab}>
          <GreetingComponent />
        </TabPanel>

        <TabPanel tabId="users" activeTab={activeTab}>
          <UserList />
        </TabPanel>
      </div>

      <div className="api-dashboard__footer">
        <Section variant="dark" spacing="lg">
          <h3>API Information</h3>
          <Grid columns="auto-fit" gap="md" minWidth="200px">
            <InfoCard title="Base URL">
              <code>/api</code>
            </InfoCard>
            
            <InfoCard title="Version">
              <span>1.0.0</span>
            </InfoCard>
            
            <InfoCard title="Status" variant="success">
              <StatusIndicator status="online" label="Online" />
            </InfoCard>
            
            <InfoCard title="Environment">
              <span>{import.meta.env.DEV ? 'Development' : 'Production'}</span>
            </InfoCard>
          </Grid>
        </Section>

        <Section variant="dark" spacing="lg">
          <h3>Available Endpoints</h3>
          <Grid columns="auto-fit" gap="md" minWidth="280px" className="endpoints-list">
            <div className="endpoint-group">
              <h4>Greeting Endpoints</h4>
              <ul>
                <li><code>GET /</code> - Get greeting message</li>
                <li><code>POST /</code> - Post greeting data</li>
                <li><code>GET /health</code> - Health check</li>
              </ul>
            </div>
            <div className="endpoint-group">
              <h4>User Endpoints</h4>
              <ul>
                <li><code>GET /users</code> - List all users</li>
                <li><code>GET /users/:id</code> - Get user by ID</li>
                <li><code>POST /users</code> - Create new user</li>
                <li><code>PUT /users/:id</code> - Update user</li>
                <li><code>DELETE /users/:id</code> - Delete user</li>
              </ul>
            </div>
          </Grid>
        </Section>
      </div>
    </Section>
  );
}

export default ApiDashboard;