import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import queryClient from './Pages/Components/queryClient';
import { QueryClientProvider } from 'react-query';

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
    <App />
  </StrictMode>
  </QueryClientProvider>
  
);
