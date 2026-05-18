import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext.jsx';
import { AppDataProvider } from './store/AppDataContext.jsx';
import App from './App.jsx';
import './styles/globals.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppDataProvider>
          <App />
        </AppDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
