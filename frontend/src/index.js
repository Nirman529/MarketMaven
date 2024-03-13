import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import MyStore from './redux/store/MyStore';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store = {MyStore}>
    <App />
  </Provider>
);