import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.scss';
import './index.css';
import App from './ProductionApp';
import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
