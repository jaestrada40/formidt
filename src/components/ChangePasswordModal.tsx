import React, { useState, useEffect } from 'react';
import { Settings, X, Eye, EyeOff, AlertCircle, CheckCircle2, Shield, ShieldOff } from 'lucide-react';
import { changePassword, getMfaStatus, toggleMfa, ApiError } from '../lib/api';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [mfaRequired, setMfaRequired] = useState<boolean | null>(null);
  const [mfaToggling, setMfaToggling] = useState(false);

  useEffect(() => {
    getMfaStatus().then((r) => setMfaRequired(r.mfaRequired)).catch(() => {});
  }, []);

  const handleToggleMfa = async () => {
    setMfaToggling(true);
    try {
      const r = await toggleMfa();
      setMfaRequired(r.mfaRequired);
    } catch {
      // ignore
    } finally {
      setMfaToggling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next !== confirm) { setError('Las contraseñas nuevas no coinciden.'); return; }
    if (next.length < 8) { setError('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    setLoading(true);
    try {
      await changePassword(current, next);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-[#c3c6d7]/50 w-full max-w-sm p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#004ac6]" />
            <h2 className="text-base font-bold text-[#121c28]">Configuración de cuenta</h2>
          </div>
          <button onClick={onClose} className="text-[#737686] hover:text-[#121c28] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MFA toggle */}
        <div className="flex items-center justify-between bg-[#f8f9ff] border border-[#c3c6d7]/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            {mfaRequired
              ? <Shield className="w-5 h-5 text-[#004ac6] shrink-0" />
              : <ShieldOff className="w-5 h-5 text-[#737686] shrink-0" />
            }
            <div>
              <p className="text-sm font-medium text-[#121c28]">Verificación en dos pasos</p>
              <p className="text-xs text-[#737686]">{mfaRequired ? 'Activa — se pide código al iniciar sesión' : 'Desactivada — solo email y contraseña'}</p>
            </div>
          </div>
          <button
            onClick={handleToggleMfa}
            disabled={mfaToggling || mfaRequired === null}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 cursor-pointer ${
              mfaRequired ? 'bg-[#004ac6]' : 'bg-[#c3c6d7]'
            }`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${mfaRequired ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="border-t border-[#c3c6d7]/40 pt-4">
          <p className="text-xs font-semibold text-[#434655] uppercase tracking-wide mb-3">Cambiar contraseña</p>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <p className="text-sm font-medium text-[#121c28]">Contraseña actualizada correctamente.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="flex items-start gap-2 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-lg p-3 text-xs text-[#93000a]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} required placeholder="Contraseña actual" value={current} onChange={(e) => setCurrent(e.target.value)}
                  className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none pr-10" />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#121c28] transition-colors">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <input type={showNext ? 'text' : 'password'} required placeholder="Nueva contraseña" value={next} onChange={(e) => setNext(e.target.value)}
                  className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none pr-10" />
                <button type="button" onClick={() => setShowNext((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#121c28] transition-colors">
                  {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input type="password" required placeholder="Confirmar nueva contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none" />
              <button type="submit" disabled={loading}
                className="w-full bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">
                {loading ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
