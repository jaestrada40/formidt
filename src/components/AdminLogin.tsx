import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { adminLogin, verifyMfa, ApiError } from '../lib/api';

interface AdminLoginProps {
  onSuccess: (email: string) => void;
}

type Stage =
  | { name: 'credentials' }
  | { name: 'mfa'; tempUserId: string }
  | { name: 'mfa-setup'; tempUserId: string; qrCodeDataUrl: string };

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [stage, setStage] = useState<Stage>({ name: 'credentials' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await adminLogin(email.trim(), password);
      if ('mfaSetupRequired' in result) {
        setStage({ name: 'mfa-setup', tempUserId: result.tempUserId, qrCodeDataUrl: result.qrCodeDataUrl });
      } else {
        setStage({ name: 'mfa', tempUserId: result.tempUserId });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stage.name === 'credentials') return;
    setError('');
    setLoading(true);
    try {
      const result = await verifyMfa(stage.tempUserId, code.trim());
      onSuccess(result.email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-[#c3c6d7]/50 max-w-sm w-full p-7 space-y-5">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#eef4ff] text-[#004ac6] flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#121c28]">Acceso Administrador</h2>
          <p className="text-xs text-[#434655]">Panel protegido con verificación en dos pasos.</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-lg p-3 text-xs text-[#93000a]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {stage.name === 'credentials' && (
          <form onSubmit={handleCredentials} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none"
            />
            <input
              type="password"
              required
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Verificando...' : 'Continuar'}
            </button>
          </form>
        )}

        {stage.name === 'mfa-setup' && (
          <form onSubmit={handleMfa} className="space-y-3">
            <p className="text-xs text-[#434655] text-center">
              Primer inicio de sesión: escanea este código con Google Authenticator o Authy para activar la verificación en dos pasos.
            </p>
            <img src={stage.qrCodeDataUrl} alt="QR MFA" className="mx-auto w-40 h-40 border border-[#c3c6d7]/50 rounded-lg" />
            <input
              type="text"
              required
              inputMode="numeric"
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm text-center tracking-widest focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Activando...' : 'Activar y entrar'}
            </button>
          </form>
        )}

        {stage.name === 'mfa' && (
          <form onSubmit={handleMfa} className="space-y-3">
            <p className="text-xs text-[#434655] text-center flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Ingresa el código de tu app autenticadora
            </p>
            <input
              type="text"
              required
              autoFocus
              inputMode="numeric"
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm text-center tracking-widest focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
