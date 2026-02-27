/**
 * StudentLinkingPage
 *
 * EXT-011 Parent Portal - Student Linking Page
 *
 * @description Dedicated page for linking a student to the parent account
 * using a verification code and selecting the relationship type.
 * Supports multi-step flow: idle -> verifying -> linking -> success/error.
 *
 * @see ET-PAR-001-parent-authentication.md
 * @created 2026-02-27
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Search,
  Link as LinkIcon,
  Users,
} from 'lucide-react';
import { useParentStore } from '@/features/parent/store/parentStore';
import { parentAPI } from '@/features/parent/api/parentAPI';
import { RelationshipType } from '@/features/parent/types/parent.types';
import type { LinkedStudent } from '@/features/parent/types/parent.types';

// ============================================================================
// TYPES
// ============================================================================

type FlowStep = 'idle' | 'verifying' | 'linking' | 'success' | 'error';

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  [RelationshipType.FATHER]: 'Padre',
  [RelationshipType.MOTHER]: 'Madre',
  [RelationshipType.GUARDIAN]: 'Tutor Legal',
  [RelationshipType.GRANDPARENT]: 'Abuelo/a',
  [RelationshipType.OTHER]: 'Otro',
};

// ============================================================================
// COMPONENT
// ============================================================================

export const StudentLinkingPage = () => {
  const navigate = useNavigate();
  const { linkStudent, verifyLink: _verifyLink, isLoading, error, clearError } = useParentStore();

  const [step, setStep] = useState<FlowStep>('idle');
  const [studentCode, setStudentCode] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(RelationshipType.FATHER);
  const [verificationCode, setVerificationCode] = useState('');
  const [linkId, setLinkId] = useState<string | null>(null);
  const [linkedStudent, setLinkedStudent] = useState<LinkedStudent | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || error;

  const handleClearErrors = () => {
    setLocalError(null);
    clearError();
  };

  // Step 1: Initiate link with student code
  const handleInitiateLink = async (e: FormEvent) => {
    e.preventDefault();
    handleClearErrors();

    if (!studentCode.trim()) {
      setLocalError('Ingresa el codigo del estudiante');
      return;
    }

    setStep('linking');
    try {
      const result = await parentAPI.linkStudent({
        studentCode: studentCode.trim().toUpperCase(),
        relationshipType,
        requireStudentApproval: false,
      });
      setLinkId(result.id);
      // If status is 'pending_verification', move to verifying step
      if (result.status === 'pending_verification') {
        setStep('verifying');
      } else {
        // Direct success (no approval needed)
        await linkStudent({ studentCode: studentCode.trim().toUpperCase(), relationshipType });
        setStep('success');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al vincular estudiante';
      setLocalError(message);
      setStep('idle');
    }
  };

  // Step 2: Verify with confirmation code (if approval-required flow)
  const handleVerifyLink = async (e: FormEvent) => {
    e.preventDefault();
    handleClearErrors();

    if (!linkId || !verificationCode.trim()) {
      setLocalError('Ingresa el codigo de verificacion');
      return;
    }

    try {
      const student = await parentAPI.verifyStudentLink({
        linkId,
        verificationCode: verificationCode.trim().toUpperCase(),
      });
      setLinkedStudent(student);
      setStep('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Codigo de verificacion incorrecto';
      setLocalError(message);
    }
  };

  const handleReset = () => {
    setStep('idle');
    setStudentCode('');
    setVerificationCode('');
    setLinkId(null);
    setLinkedStudent(null);
    handleClearErrors();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate('/parent/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Volver al dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Vincular Estudiante</h1>
                <p className="text-xs text-gray-500">Conecta a tu hijo con tu cuenta</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {/* ===== SUCCESS STATE ===== */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-sm p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Vinculacion Exitosa
              </h2>

              {linkedStudent ? (
                <div className="mt-4 mb-6 p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                  {linkedStudent.avatarUrl ? (
                    <img
                      src={linkedStudent.avatarUrl}
                      alt={linkedStudent.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {linkedStudent.displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{linkedStudent.displayName}</p>
                    <p className="text-sm text-gray-500">
                      {RELATIONSHIP_LABELS[linkedStudent.relationshipType]}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mt-2 mb-6">
                  El estudiante ha sido vinculado a tu cuenta correctamente.
                </p>
              )}

              <div className="flex flex-col gap-3">
                <Link
                  to="/parent/dashboard"
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-center"
                >
                  Ir al Dashboard
                </Link>
                <button
                  onClick={handleReset}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Vincular Otro Estudiante
                </button>
              </div>
            </motion.div>
          )}

          {/* ===== VERIFICATION STEP ===== */}
          {step === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Verificar Vinculacion</h2>
                <p className="text-sm text-gray-500 mt-2">
                  El estudiante recibi un codigo de verificacion. Ingrésalo a continuacion.
                </p>
              </div>

              {displayError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{displayError}</span>
                </motion.div>
              )}

              <form onSubmit={handleVerifyLink} className="space-y-4">
                <div>
                  <label
                    htmlFor="verificationCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Codigo de Verificacion
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    placeholder="Ej: VER-123456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg tracking-widest font-mono"
                    maxLength={12}
                    autoComplete="one-time-code"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    El estudiante encontrara este codigo en su aplicacion GAMILIT
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !verificationCode.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Verificar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ===== IDLE / FORM STEP ===== */}
          {(step === 'idle' || step === 'linking') && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Info card */}
              <div className="bg-indigo-50 rounded-2xl p-5 mb-6 flex items-start gap-4">
                <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0 mt-0.5">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-indigo-900 mb-1">Como funciona</h2>
                  <ol className="text-sm text-indigo-700 space-y-1 list-decimal list-inside">
                    <li>Tu hijo tiene un codigo de estudiante en GAMILIT</li>
                    <li>Ingresa el codigo y selecciona tu relacion</li>
                    <li>El estudiante confirma la vinculacion</li>
                    <li>Podras ver su progreso en tu portal</li>
                  </ol>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <LinkIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Ingresar Datos</h2>
                </div>

                {displayError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{displayError}</span>
                  </motion.div>
                )}

                <form onSubmit={handleInitiateLink} className="space-y-5">
                  <div>
                    <label
                      htmlFor="studentCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Codigo del Estudiante
                    </label>
                    <input
                      id="studentCode"
                      type="text"
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                      placeholder="Ej: STU-ABC123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono tracking-wide"
                      autoComplete="off"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Tu hijo encontrara este codigo en Configuracion &gt; Mi Cuenta dentro de GAMILIT
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="relationshipType"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tu relacion con el estudiante
                    </label>
                    <select
                      id="relationshipType"
                      value={relationshipType}
                      onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                      {(Object.entries(RELATIONSHIP_LABELS) as [RelationshipType, string][]).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || step === 'linking' || !studentCode.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {step === 'linking' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        Vinculando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Vincular Estudiante
                      </>
                    )}
                  </button>
                </form>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                ¿Ya tienes estudiantes vinculados?{' '}
                <Link to="/parent/dashboard" className="text-indigo-600 hover:underline">
                  Ver Dashboard
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StudentLinkingPage;
