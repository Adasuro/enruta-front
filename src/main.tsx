import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { UIProvider } from './contexts/UIContext.tsx';

/* Estilos Maestros - CFA Standard */
import './styles/theme.css';

// Registro de Service Worker para Instalabilidad PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registrado', reg))
      .catch(err => console.error('Error SW', err));
  });
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <UIProvider>
              <App />
            </UIProvider>
          </NotificationProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
