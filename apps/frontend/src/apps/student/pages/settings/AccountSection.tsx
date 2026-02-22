import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Key, Check, Loader2 } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import toast from 'react-hot-toast';
import { profileAPI } from '@/services/api/profileAPI';
import { useApiError } from '@shared/hooks';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { SaveButton, type SaveStatus } from '@shared/components/feedback/SaveButton';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import type { User } from '@/shared/types/auth.types';

interface AccountSectionProps {
  user: User;
}

export const AccountSection = ({ user }: AccountSectionProps) => {
  const { handleError } = useApiError();
  const [passwordStatus, setPasswordStatus] = useState<SaveStatus>('idle');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [account, setAccount] = useState({
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Inline validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!account.currentPassword) errs.currentPassword = 'Ingresa tu contrasena actual';
    if (!account.newPassword) errs.newPassword = 'Ingresa la nueva contrasena';
    else if (account.newPassword.length < 8) errs.newPassword = 'Minimo 8 caracteres';
    if (account.newPassword !== account.confirmPassword)
      errs.confirmPassword = 'Las contrasenas no coinciden';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'sending' | 'verifying' | 'success' | 'error'
  >('idle');

  useEffect(() => {
    const checkVerification = async () => {
      const token = localStorage.getItem('auth-token');
      if (!token || !user.id) return;
      try {
        const status = await profileAPI.getEmailVerificationStatus();
        setIsEmailVerified(status.verified);
      } catch (error: unknown) {
        const st = (error as { response?: { status?: number } })?.response?.status;
        if (st !== 401) console.error('Error checking verification status:', error);
      }
    };
    checkVerification();
  }, [user.id]);

  const handleRequestVerification = async () => {
    setVerificationStatus('sending');
    try {
      await profileAPI.resendEmailVerification();
      setShowVerificationModal(true);
      setVerificationStatus('idle');
      toast.success('Codigo de verificacion enviado a tu email');
    } catch (err: unknown) {
      setVerificationStatus('error');
      handleError(err, 'Error al enviar codigo de verificacion');
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationToken.trim()) {
      toast.error('Ingresa el codigo de verificacion');
      return;
    }
    setVerificationStatus('verifying');
    try {
      const result = await profileAPI.verifyEmail(verificationToken);
      if (result.verified) {
        setIsEmailVerified(true);
        setShowVerificationModal(false);
        setVerificationToken('');
        toast.success('Email verificado correctamente');
      }
      setVerificationStatus('success');
    } catch (err: unknown) {
      setVerificationStatus('error');
      handleError(err, 'Codigo de verificacion invalido');
    }
  };

  const handlePasswordChange = async () => {
    if (!validate()) return;
    setPasswordStatus('saving');
    try {
      await profileAPI.updatePassword(user.id, {
        current_password: account.currentPassword,
        new_password: account.newPassword,
      });
      toast.success('Contrasena actualizada correctamente');
      setPasswordStatus('saved');
      setAccount({ ...account, currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setTimeout(() => setPasswordStatus('idle'), 2000);
    } catch (err: unknown) {
      setPasswordStatus('error');
      handleError(err, 'Error al cambiar contrasena');
      setTimeout(() => setPasswordStatus('idle'), 3000);
    }
  };

  const inputClass =
    'w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3 pr-10 transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20';
  const errorInputClass = 'border-red-400 focus:border-red-500 focus:ring-red-200';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <DetectiveCard>
          <h2 className="mb-2 text-2xl font-bold text-detective-text">
            Configuracion de Cuenta
          </h2>
          <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

          <div className="space-y-8">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Correo electronico
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={account.email}
                  readOnly
                  className="flex-1 rounded-lg border-2 border-detective-orange/40 bg-gray-50 px-4 py-3 text-detective-text-secondary transition-all duration-200"
                />
                {isEmailVerified ? (
                  <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 font-medium text-green-700">
                    <Check className="h-4 w-4" />
                    Verificado
                  </div>
                ) : (
                  <button
                    onClick={handleRequestVerification}
                    disabled={verificationStatus === 'sending'}
                    className="flex items-center gap-2 rounded-lg bg-detective-blue px-4 py-2 font-medium text-white transition-colors hover:bg-detective-blue-dark disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {verificationStatus === 'sending' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Verificar'
                    )}
                  </button>
                )}
              </div>
            </div>

            <hr className="border-detective-bg" />

            {/* Change Password */}
            <h3 className="flex items-center gap-2 text-xl font-bold text-detective-text">
              <Key className="h-5 w-5 text-detective-orange" />
              Cambiar Contrasena
            </h3>

            {/* Current Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-detective-text">
                  Contrasena actual
                </label>
                <span className="flex items-center gap-1 text-xs text-detective-text-secondary">
                  <Shield className="h-3 w-3" />
                  Requerido para cambiar
                </span>
              </div>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={account.currentPassword}
                  onChange={(e) => {
                    setAccount({ ...account, currentPassword: e.target.value });
                    if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' });
                  }}
                  className={`${inputClass} ${errors.currentPassword ? errorInputClass : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-detective-text-secondary"
                >
                  {showCurrentPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Nueva contrasena
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={account.newPassword}
                  onChange={(e) => {
                    setAccount({ ...account, newPassword: e.target.value });
                    if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                  }}
                  className={`${inputClass} ${errors.newPassword ? errorInputClass : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-detective-text-secondary"
                >
                  {showNewPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
              )}
              <PasswordStrengthIndicator password={account.newPassword} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Confirmar nueva contrasena
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={account.confirmPassword}
                  onChange={(e) => {
                    setAccount({ ...account, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={`${inputClass} ${errors.confirmPassword ? errorInputClass : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-detective-text-secondary"
                >
                  {showConfirmPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <SaveButton
              status={passwordStatus}
              onClick={handlePasswordChange}
              idleLabel="Actualizar Contrasena"
              idleIcon={<Key className="h-4 w-4" />}
            />
          </div>
        </DetectiveCard>
      </motion.div>

      {/* Email Verification Modal */}
      <Modal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setVerificationToken('');
          setVerificationStatus('idle');
        }}
        animated
        size="md"
        showCloseButton={false}
        overlayClassName="bg-black/50"
        className="rounded-xl shadow-xl"
        contentClassName="custom"
      >
        <div className="p-6">
          <h3 className="mb-4 text-xl font-bold text-detective-text">
            Verificar tu email
          </h3>
          <p className="mb-4 text-sm text-detective-text-secondary">
            Enviamos un codigo de verificacion a <strong>{account.email}</strong>. Ingresalo a continuacion.
          </p>
          <input
            type="text"
            value={verificationToken}
            onChange={(e) => setVerificationToken(e.target.value)}
            placeholder="Codigo de verificacion"
            className="mb-4 w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3 transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowVerificationModal(false);
                setVerificationToken('');
                setVerificationStatus('idle');
              }}
              className="flex-1 rounded-lg border-2 border-detective-orange/40 px-4 py-2 font-medium text-detective-text transition-colors hover:bg-detective-bg"
            >
              Cancelar
            </button>
            <button
              onClick={handleVerifyEmail}
              disabled={verificationStatus === 'verifying'}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {verificationStatus === 'verifying' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar'
              )}
            </button>
          </div>
          <button
            onClick={handleRequestVerification}
            disabled={verificationStatus === 'sending'}
            className="mt-4 w-full text-center text-sm text-detective-text-secondary hover:text-detective-orange"
          >
            {verificationStatus === 'sending'
              ? 'Enviando...'
              : 'No recibiste el codigo? Reenviar'}
          </button>
        </div>
      </Modal>
    </>
  );
};
