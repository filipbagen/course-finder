import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // In your App component or main entry file
  <Router>
    <App />
  </Router>
);
