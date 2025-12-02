/**
 * Greeting component for testing API greeting functionality
 */

import { useState } from 'preact/hooks';
import { useAppDispatch, useAppSelector, fetchGreeting, postGreeting, checkHealth, clearError, clearGreeting } from '../../store';
import './GreetingComponent.css';

interface GreetingComponentProps {
  className?: string;
}

export function GreetingComponent({ className = '' }: GreetingComponentProps) {
  const dispatch = useAppDispatch();
  const { greeting, health, loading, error } = useAppSelector((state) => state.api);
  
  const [name, setName] = useState('');

  const handleGetGreeting = () => {
    const trimmedName = name?.trim();
    if (trimmedName) {
      dispatch(fetchGreeting(trimmedName));
    }
  };

  const handlePostGreeting = () => {
    const trimmedName = name?.trim();
    if (trimmedName) {
      const data = {
        name: trimmedName,
        timestamp: new Date().toISOString(),
      };
      dispatch(postGreeting(data));
    }
  };

  const handleHealthCheck = () => {
    dispatch(checkHealth());
  };

  const handleClearGreeting = () => {
    dispatch(clearGreeting());
    setName('');
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className={`greeting-component ${className}`}>
      <div className="greeting-component__header">
        <h2>API Greeting & Health Check</h2>
      </div>

      {error != null && error !== '' && (
        <div className="greeting-component__error">
          <p>Error: {error}</p>
          <button type="button" onClick={handleClearError} className="btn btn--small">
            Dismiss
          </button>
        </div>
      )}

      <div className="greeting-component__controls">
        <div className="form-group">
          <label htmlFor="greeting-name">Enter your name:</label>
          <input
            type="text"
            id="greeting-name"
            value={name}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Enter your name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleGetGreeting();
              }
            }}
          />
        </div>
        
        <div className="greeting-component__actions">
          <button
            type="button"
            onClick={handleGetGreeting}
            disabled={loading || !name?.trim()}
            className="btn btn--primary"
          >
            {loading ? 'Loading...' : 'Get Greeting (GET)'}
          </button>
          
          <button
            type="button"
            onClick={handlePostGreeting}
            disabled={loading || !name?.trim()}
            className="btn btn--success"
          >
            {loading ? 'Loading...' : 'Post Greeting (POST)'}
          </button>
          
          <button
            type="button"
            onClick={handleHealthCheck}
            disabled={loading}
            className="btn btn--info"
          >
            {loading ? 'Loading...' : 'Health Check'}
          </button>
          
          <button
            type="button"
            onClick={handleClearGreeting}
            className="btn btn--secondary"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="greeting-component__results">
        {greeting && (
          <div className="greeting-result">
            <h3>GET Greeting Result:</h3>
            <div className="greeting-result__message">
              <strong>{greeting}</strong>
            </div>
            <div className="greeting-result__timestamp">
              Fetched at: {new Date().toLocaleString()}
            </div>
          </div>
        )}

        {health && (
          <div className="health-result">
            <h3>Health Check Result:</h3>
            <div className="health-result__status">
              Status: <strong className={health.healthy ? 'text-success' : 'text-danger'}>
                {health.healthy ? 'Healthy' : 'Unhealthy'}
              </strong>
            </div>
            <div className="health-result__uptime">
              Uptime: <strong>{Math.round(health.uptime)} seconds</strong>
            </div>
            <div className="health-result__timestamp">
              Checked at: {new Date().toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <div className="greeting-component__info">
        <h3>API Endpoints Information:</h3>
        <div className="api-endpoints">
          <div className="api-endpoint">
            <strong>GET /</strong>
            <span>Returns a greeting message with optional name parameter</span>
          </div>
          <div className="api-endpoint">
            <strong>POST /</strong>
            <span>Processes request body and returns confirmation</span>
          </div>
          <div className="api-endpoint">
            <strong>GET /health</strong>
            <span>Health check endpoint for monitoring API status</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GreetingComponent;