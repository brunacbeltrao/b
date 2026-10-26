import React, { useState } from 'react';
import { BrandBIcon } from '../components/BrandB';
import { Button, Input, Label } from '../components/ui';
import { login } from './session';

const MESSAGES = {
  invalid: 'Senha incorreta.',
  throttled: 'Muitas tentativas. Espere 5 minutos e tente de novo.',
  offline: 'Sem conexão com o servidor. Verifique a internet.',
};

export const LoginScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setBusy(true);
    setError('');
    const result = await login(password);
    setBusy(false);
    if (result === 'ok') onSuccess();
    else setError(MESSAGES[result]);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#f6f5f7] px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-[#e6e4e8] rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <BrandBIcon size="md" />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-[#1c1a1e]">Bruna OS</div>
            <div className="text-xs text-stone-500">Entre para ver seus dados</div>
          </div>
        </div>
        <div>
          <Label htmlFor="login-password">Senha</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && (
            <p className="mt-2 text-[13px] text-[#8b1538]" role="alert">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={busy || !password.trim()}>
          {busy ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
};
