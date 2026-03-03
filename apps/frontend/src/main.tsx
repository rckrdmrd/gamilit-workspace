import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './shared/styles/index.css';
import { runMigrations } from './shared/utils/migrateLocalStorage';
import { queryClient } from '@/shared/lib/queryClient';

// Run localStorage migrations before app initialization
// This ensures backward compatibility for users with existing sessions
runMigrations();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
