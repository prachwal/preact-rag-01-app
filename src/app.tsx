import { useState, useCallback, useMemo } from 'preact/hooks';
import preactLogo from './assets/preact.svg';
import { ApiDashboard, DemoSection } from './components/api';
import { Logo, NavTab } from './components/ui';
import './styles/styles.scss';

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
      <header class="app-header" role="banner">
        <div class="app-header__content">
          <div class="app-header__logos">
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Vite website"
            >
              <Logo
                src="/vite.svg"
                alt="Vite logo"
              />
            </a>
            <a
              href="https://preactjs.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Preact website"
            >
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
        <div class="nav-tabs" role="tablist" aria-label="Application sections">
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

      <main role="main" aria-labelledby="main-content">
        <div id="main-content">
          {activeView === 'demo' ? (
            <article class="demo-article" aria-labelledby="demo-heading">
              <DemoSection />
            </article>
          ) : (
            <section class="api-section" aria-labelledby="api-dashboard-title">
              <article class="api-article">
                <ApiDashboard />
              </article>
            </section>
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
