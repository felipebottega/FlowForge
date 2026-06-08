import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/index.css';

/**
 * Entry point for the FlowForge React application.
 * Mounts the App component into the 'root' element of the index.html.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);