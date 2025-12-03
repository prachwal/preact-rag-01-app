/**
 * Main API Dashboard component
 */

import { useState } from 'preact/hooks';
import { UserList } from './UserList';
import { GreetingComponent } from './GreetingComponent';

interface ApiDashboardProps {
  className?: string;
}

export function ApiDashboard({ className = '' }: ApiDashboardProps) {
  const [activeTab, setActiveTab] = useState<'greeting' | 'users'>('greeting');

  const tabs = [
    { id: 'greeting' as const, label: 'Greeting & Health', icon: '👋' },
    { id: 'users' as const, label: 'Users Management', icon: '👥' },
  ];

  return (
    <div className={`api-dashboard ${className}`}>
      <div className="api-dashboard__header">
        <h1>API Dashboard</h1>
        <p className="api-dashboard__subtitle">
          Test and manage all available API endpoints
        </p>
      </div>

      <div className="api-dashboard__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'tab-button--active' : ''}`}
          >
            <span className="tab-button__icon">{tab.icon}</span>
            <span className="tab-button__label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="api-dashboard__content">
        <div className="api-dashboard__tab-content">
          {activeTab === 'greeting' && <GreetingComponent />}
          {activeTab === 'users' && <UserList />}
        </div>
      </div>

      <div className="api-dashboard__footer">
        <div className="api-dashboard__info">
          <h3>API Information</h3>
          <div className="api-info-grid">
            <div className="api-info-card">
              <h4>Base URL</h4>
              <code>/api</code>
            </div>
            <div className="api-info-card">
              <h4>Version</h4>
              <span>1.0.0</span>
            </div>
            <div className="api-info-card">
              <h4>Status</h4>
              <span className="status-indicator status-indicator--online">Online</span>
            </div>
            <div className="api-info-card">
              <h4>Environment</h4>
              <span>{import.meta.env.DEV ? 'Development' : 'Production'}</span>
            </div>
          </div>
        </div>

        <div className="api-dashboard__endpoints">
          <h3>Available Endpoints</h3>
          <div className="endpoints-list">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiDashboard;