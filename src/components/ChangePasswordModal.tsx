import React, { useState } from 'react';
import { KeyRound, X, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { changePassword, ApiError } from '../lib/api';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next !== confirm) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (next.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
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
            <KeyRound className="w-5 h-5 text-[#004ac6]" />
            <h2 className="text-base font-bold text-[#121c28]">Cambiar contraseña</h2>
          </div>
          <button onClick={onClose} className="text-[#737686] hover:text-[#121c28] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="text-sm font-medium text-[#121c28]">Contraseña actualizada correctamente.</p>
            <button
              onClick={onClose}
              className="w-full bg-[#004ac6] hover:bg-[#003ea8] text-white font-medium text-sm py-2.5 rounded-lg transition-colors mt-2"
            >
              Cerrar
            </button>
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
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                placeholder="Contraseña actual"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none pr-10"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#121c28] transition-colors">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showNext ? 'text' : 'password'}
                required
                placeholder="Nueva contraseña"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none pr-10"
              />
              <button type="button" onClick={() => setShowNext((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#121c28] transition-colors">
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <input
              type="password"
              required
              placeholder="Confirmar nueva contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
