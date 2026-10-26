import {StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {boot, BootResult} from './auth/session';
import {LoginScreen} from './auth/LoginScreen';

function Root() {
  const [state, setState] = useState<BootResult | 'loading'>('loading');

  useEffect(() => {
    boot().then(setState);
  }, []);

  if (state === 'loading') return <div className="min-h-[100dvh] bg-[#f6f5f7]" aria-busy="true" />;
  if (state === 'login') return <LoginScreen onSuccess={() => setState('app')} />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
