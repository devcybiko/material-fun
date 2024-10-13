import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');  // Get the root DOM element
const root = createRoot(container);  // Create a root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
