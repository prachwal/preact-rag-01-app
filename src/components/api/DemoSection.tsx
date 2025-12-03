import { useState, useCallback } from 'preact/hooks';
import { Button } from '../ui/Button/Button';
import { Card } from '../ui/Card/Card';

export interface DemoSectionProps {
  className?: string;
}

export function DemoSection({ className }: DemoSectionProps) {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <div class={`demo-section ${className ?? ''}`}>
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
}
