import React, { useState, useEffect } from 'react';
import { Settings, X, Eye, EyeOff, AlertCircle, CheckCircle2, Shield, ShieldOff } from 'lucide-react';
import { changePassword, getMfaStatus, toggleMfa, resetMfa, ApiError } from '../lib/api';

interface Props { onClose: () => void; }

function useTotpCountdown() {
  const [seconds, setSeconds] = useState(() => 30 - (Math.floor(Date.now() / 1000) % 30));
  useEffect(() => {
    const id = setInterval(() => setSeconds(30 - (Math.floor(Date.now() / 1000) % 30)), 500);
    return () => clearInterval(id);
  }, []);
  return seconds;
}

export const ChangePasswordModal: React.FC<Props> = ({ onClose }) => {
  // Password change
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // MFA
  const [mfaRequired, setMfaRequired] = useState<boolean | null>(null);
  const [mfaToggling, setMfaToggling] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  // New device / re-enroll
  const [showNewDevice, setShowNewDevice] = useState(false);
  const [newDeviceCode, setNewDeviceCode] = useState('');
  const [newDeviceLoading, setNewDeviceLoading] = useState(false);
  const [newDeviceQr, setNewDeviceQr] = useState('');
  const countdown = useTotpCountdown();

  useEffect(() => {
    getMfaStatus().then((r) => setMfaRequired(r.mfaRequired)).catch(() => {});
  }, []);

  const handleNewDevice = async () => {
    setNewDeviceLoading(true);
    setMfaError('');
    try {
      const r = await resetMfa(newDeviceCode || undefined);
      setNewDeviceQr(r.qrCodeDataUrl);
      setNewDeviceCode('');
    } catch (err) {
      setMfaError(err instanceof ApiError ? err.message : 'Error al regenerar QR.');
    } finally {
      setNewDeviceLoading(false);
    }
  };

  const handleToggleClick = () => {
    setMfaError('');
    if (mfaRequired) {
      // Disabling — ask for code first
      setConfirmDisable(true);
    } else {
      // Enabling — no code needed
      doToggle();
    }
  };

  const doToggle = async (code?: string) => {
    setMfaToggling(true);
    setMfaError('');
    try {
      const r = await toggleMfa(code);
      setMfaRequired(r.mfaRequired);
      setConfirmDisable(false);
      setDisableCode('');
    } catch (err) {
      setMfaError(err instanceof ApiError ? err.message : 'Error al cambiar MFA.');
    } finally {
      setMfaToggling(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (next !== confirm) { setPwError('Las contraseñas nuevas no coinciden.'); return; }
    if (next.length < 8) { setPwError('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    setPwLoading(true);
    try {
      await changePassword(current, next);
      setPwSuccess(true);
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : 'Error al cambiar la contraseña.');
    } finally {
      setPwLoading(false);
    }
  };

  const pct = (countdown / 30) * 100;
  const r = 10;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-[#c3c6d7]/50 w-full max-w-sm p-7 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#004ac6]" />
            <h2 className="text-base font-bold text-[#121c28]">Configuración de cuenta</h2>
          </div>
          <button onClick={onClose} className="text-[#737686] hover:text-[#121c28] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MFA section */}
        <div className="bg-[#f8f9ff] border border-[#c3c6d7]/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mfaRequired
                ? <Shield className="w-5 h-5 text-[#004ac6] shrink-0" />
                : <ShieldOff className="w-5 h-5 text-[#737686] shrink-0" />}
              <div>
                <p className="text-sm font-medium text-[#121c28]">Verificación en dos pasos</p>
                <p className="text-xs text-[#737686]">
                  {mfaRequired ? 'Activa — se pide código al iniciar sesión' : 'Desactivada — solo email y contraseña'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Countdown ring — only when MFA is active */}
              {mfaRequired && (
                <div className="flex flex-col items-center" title={`Código válido por ${countdown}s`}>
                  <svg width="28" height="28" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle
                      cx="14" cy="14" r={r} fill="none"
                      stroke={countdown <= 5 ? '#ba1a1a' : '#004ac6'}
                      strokeWidth="3"
                      strokeDasharray={`${dash} ${circ}`}
                      strokeLinecap="round"
                      transform="rotate(-90 14 14)"
                      style={{ transition: 'stroke-dasharray 0.5s linear' }}
                    />
                    <text x="14" y="18" textAnchor="middle" fontSize="9" fill={countdown <= 5 ? '#ba1a1a' : '#004ac6'} fontWeight="600">
                      {countdown}
                    </text>
                  </svg>
                </div>
              )}

              {/* Toggle switch */}
              <button
                onClick={handleToggleClick}
                disabled={mfaToggling || mfaRequired === null}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 cursor-pointer ${
                  mfaRequired ? 'bg-[#004ac6]' : 'bg-[#c3c6d7]'
                }`}
              >
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${mfaRequired ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Confirm disable — code input */}
          {confirmDisable && (
            <div className="space-y-2 pt-1 border-t border-[#c3c6d7]/40">
              <p className="text-xs text-[#434655]">Ingresa el código de tu app para confirmar que eres tú:</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Código de 6 dígitos"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm text-center tracking-widest focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none"
              />
              {mfaError && (
                <div className="flex items-center gap-1.5 text-xs text-[#93000a]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />{mfaError}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setConfirmDisable(false); setDisableCode(''); setMfaError(''); }}
                  className="flex-1 border border-[#c3c6d7] text-sm py-1.5 rounded-lg text-[#434655] hover:bg-[#f8f9ff] transition-colors">
                  Cancelar
                </button>
                <button onClick={() => doToggle(disableCode)} disabled={disableCode.length !== 6 || mfaToggling}
                  className="flex-1 bg-[#ba1a1a] hover:bg-[#93000a] disabled:opacity-50 text-white text-sm py-1.5 rounded-lg transition-colors">
                  {mfaToggling ? '...' : 'Desactivar'}
                </button>
              </div>
            </div>
          )}

          {!confirmDisable && mfaError && (
            <div className="flex items-center gap-1.5 text-xs text-[#93000a]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{mfaError}
            </div>
          )}

          {/* New device */}
          {mfaRequired && !confirmDisable && (
            !showNewDevice ? (
              <button onClick={() => { setShowNewDevice(true); setNewDeviceQr(''); setMfaError(''); }}
                className="text-xs text-[#004ac6] hover:underline w-fit">
                ¿Tienes otro dispositivo? Escanea de nuevo
              </button>
            ) : newDeviceQr ? (
              <div className="space-y-2 pt-1 border-t border-[#c3c6d7]/40">
                <p className="text-xs text-[#434655] text-center">Escanea este QR con tu nueva app autenticadora:</p>
                <img src={newDeviceQr} alt="QR MFA" className="mx-auto w-40 h-40 border border-[#c3c6d7]/50 rounded-lg" />
                <p className="text-xs text-[#737686] text-center">Una vez escaneado, inicia sesión normalmente.</p>
                <button onClick={() => { setShowNewDevice(false); setNewDeviceQr(''); }}
                  className="w-full border border-[#c3c6d7] text-sm py-1.5 rounded-lg text-[#434655] hover:bg-[#f8f9ff] transition-colors">
                  Listo
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1 border-t border-[#c3c6d7]/40">
                <p className="text-xs text-[#434655]">Ingresa el código actual para confirmar y generar un nuevo QR:</p>
                <input
                  type="text" inputMode="numeric" maxLength={6} placeholder="Código de 6 dígitos"
                  value={newDeviceCode} onChange={(e) => setNewDeviceCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-[#c3c6d7] rounded-md px-3 py-2 text-sm text-center tracking-widest focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none"
                />
                {mfaError && <div className="flex items-center gap-1.5 text-xs text-[#93000a]"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{mfaError}</div>}
                <div className="flex gap-2">
                  <button onClick={() => { setShowNewDevice(false); setNewDeviceCode(''); setMfaError(''); }}
                    className="flex-1 border border-[#c3c6d7] text-sm py-1.5 rounded-lg text-[#434655] hover:bg-[#f8f9ff] transition-colors">
                    Cancelar
                  </button>
                  <button onClick={handleNewDevice} disabled={newDeviceCode.length !== 6 || newDeviceLoading}
                    className="flex-1 bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-50 text-white text-sm py-1.5 rounded-lg transition-colors">
                    {newDeviceLoading ? '...' : 'Generar QR'}
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Password change */}
        <div className="border-t border-[#c3c6d7]/40 pt-4">
          <p className="text-xs font-semibold text-[#434655] uppercase tracking-wide mb-3">Cambiar contraseña</p>
          {pwSuccess ? (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Contraseña actualizada correctamente.
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              {pwError && (
                <div className="flex items-start gap-2 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-lg p-3 text-xs text-[#93000a]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{pwError}</span>
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
              <button type="submit" disabled={pwLoading}
                className="w-full bg-[#004ac6] hover:bg-[#003ea8] disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">
                {pwLoading ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
