import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SearchProvider } from './SearchContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SearchProvider>
    <App />
  </SearchProvider>
);