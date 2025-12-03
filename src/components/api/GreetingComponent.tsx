/**
 * Greeting component for testing API greeting functionality
 */

import { useState } from 'preact/hooks';
import { useGetGreetingQuery, usePostGreetingMutation, useGetHealthQuery } from '../../store/slices/apiSlice';

interface GreetingComponentProps {
  className?: string;
}

export function GreetingComponent({ className = '' }: GreetingComponentProps) {
  const [name, setName] = useState('');
  const [skipGreeting, setSkipGreeting] = useState(true);

  // RTK Query hooks
  const { data: greetingData, isLoading: greetingLoading, error: greetingError } = useGetGreetingQuery(
    name?.trim() || undefined,
    { skip: skipGreeting || !name?.trim() }
  );

  const [postGreeting, { isLoading: postLoading, error: postError }] = usePostGreetingMutation();

  const { data: healthData, isLoading: healthLoading, error: healthError, refetch: refetchHealth } = useGetHealthQuery();

  // Combine loading and error states
  const loading = greetingLoading || postLoading || healthLoading;
  const combinedError = greetingError || postError || healthError;
  const greeting = greetingData?.payload?.message || '';
  const health = healthData?.payload || null;

  const handleGetGreeting = () => {
    const trimmedName = name?.trim();
    if (trimmedName) {
      setSkipGreeting(false);
    }
  };

  const handlePostGreeting = async () => {
    const trimmedName = name?.trim();
    if (trimmedName) {
      try {
        const data = {
          name: trimmedName,
          timestamp: new Date().toISOString(),
        };
        await postGreeting(data).unwrap();
        // Optionally refetch greeting after posting
        setSkipGreeting(false);
      } catch (error) {
        console.error('Failed to post greeting:', error);
      }
    }
  };

  const handleHealthCheck = () => {
    refetchHealth();
  };

  const handleClearGreeting = () => {
    setSkipGreeting(true);
    setName('');
  };

  const handleClearError = () => {
    // RTK Query handles errors automatically, but we can clear by resetting state
    setSkipGreeting(true);
  };

  // Helper function to get error message
  const getErrorMessage = (error: any) => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if ('message' in error) return error.message;
    if ('error' in error) return error.error;
    if ('data' in error && error.data?.message) return error.data.message;
    return 'An error occurred';
  };

  const errorMessage = getErrorMessage(combinedError);

  return (
    <div className={`greeting-component ${className}`}>
      <div className="greeting-component__header">
        <h2>API Greeting & Health Check</h2>
      </div>

      {errorMessage && (
        <div className="greeting-component__error">
          <p>Error: {errorMessage}</p>
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