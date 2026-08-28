/**
 * Application Entry Point
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initNeutralino } from './services/neutralino';

// Initialize Neutralino.js native runtime if running as a desktop app
initNeutralino().catch((err) => {
  console.warn('Neutralino initialization skipped:', err);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

