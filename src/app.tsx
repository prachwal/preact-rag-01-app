import { useState, useCallback, useMemo } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import preactLogo from './assets/preact.svg';
import { ApiDashboard } from './components/api';
import './app.css';

/**
 * Main application component for the Preact RAG app.
 *
 * This component demonstrates:
 * - Redux state management integration
 * - API communication with backend
 * - Multiple application modes (demo and API dashboard)
 * - Optimized component structure with proper performance patterns
 *
 * @example
 * ```tsx
 * import { App } from './app';
 *
 * function Main() {
 *   return <App />;
 * }
 * ```
 *
 * @returns The main application interface
 */

// Optimized reusable components
const Logo = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <img src={src} alt={alt} class={`logo ${className ?? ''}`} loading="lazy" />
);

const NavTab = ({ 
  active, 
  icon, 
  label, 
  onClick 
}: { 
  active: boolean; 
  icon: string; 
  label: string; 
  onClick: () => void;
}) => (
  <button 
    type="button" 
    class={`nav-tab ${active ? 'nav-tab--active' : ''}`}
    onClick={onClick}
    aria-selected={active}
  >
    <span class="nav-tab__icon" role="img" aria-label={icon}>{icon}</span>
    <span class="nav-tab__label">{label}</span>
  </button>
);

const Card = ({ children }: { children: ComponentChildren }) => (
  <div class="card">{children}</div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: { 
  children: ComponentChildren; 
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
}) => (
  <button 
    type="button"
    class={`btn btn--${variant}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

// Demo Section Component
const DemoSection = () => {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <div class="demo-section">
      <h2>Preact Demo</h2>
      <Card>
        <Button onClick={increment}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/app.tsx</code> and save to test HMR
        </p>
      </Card>
      <p>
        Check out{' '}
        <a 
          href="https://preactjs.com/guide/v10/getting-started#create-a-vite-powered-preact-app" 
          target="_blank"
          rel="noopener noreferrer"
        >
          create-preact
        </a>
        , the official Preact + Vite starter
      </p>
      <p class="read-the-docs">
        Click on the Vite and Preact logos to learn more
      </p>
    </div>
  );
};

export function App() {
  const [activeView, setActiveView] = useState<'demo' | 'api'>('demo');

  const handleTabChange = useCallback((view: 'demo' | 'api') => {
    setActiveView(view);
  }, []);

  const views = useMemo(() => ([
    { id: 'demo' as const, label: 'Demo', icon: '⚡' },
    { id: 'api' as const, label: 'API Dashboard', icon: '🔌' },
  ]), []);

  return (
    <div class="app-container">
      <header class="app-header">
        <div class="app-header__content">
          <div class="app-header__logos">
            <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
              <Logo 
                src="/vite.svg" 
                alt="Vite logo" 
              />
            </a>
            <a href="https://preactjs.com" target="_blank" rel="noopener noreferrer">
              <Logo 
                src={preactLogo} 
                alt="Preact logo" 
                className="preact"
              />
            </a>
          </div>
          <h1 class="app-header__title">
            Preact RAG App with Redux & API
          </h1>
          <p class="app-header__subtitle">
            Redux Toolkit integration with API endpoints
          </p>
        </div>
      </header>

      <nav class="app-nav" role="navigation" aria-label="Main navigation">
        <div class="nav-tabs" role="tablist">
          {views.map((view) => (
            <NavTab
              key={view.id}
              active={activeView === view.id}
              icon={view.icon}
              label={view.label}
              onClick={() => handleTabChange(view.id)}
            />
          ))}
        </div>
      </nav>

      <main class="app-main" role="main">
        <div class="app-main__content">
          {activeView === 'demo' ? (
            <DemoSection />
          ) : (
            <div class="api-section">
              <ApiDashboard />
            </div>
          )}
        </div>
      </main>

      <footer class="app-footer" role="contentinfo">
        <div class="app-footer__content">
          <p>Built with Preact, Redux Toolkit, and Vite</p>
          <p>API integration with Netlify Functions</p>
        </div>
      </footer>
    </div>
  );
}
