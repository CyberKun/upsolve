import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/globals.css';
import { applyTheme, readTheme } from './shared/theme/themes';

// This Vite SPA applies the saved palette before mounting React: no hydration.
applyTheme(readTheme());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
