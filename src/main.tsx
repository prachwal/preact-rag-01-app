import { render } from 'preact';
import './index.css';
import { App } from './app.tsx';
import { Provider } from 'react-redux';
import { store } from './store';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Failed to find app container element');
}

render(
  <Provider store={store}>
    <App />
  </Provider>,
  container
);
