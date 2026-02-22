/**
 * CreateUserModal - Modal para crear usuarios desde Admin
 *
 * @description Modal para crear estudiantes o profesores con asignación a organización.
 * @see US-AE-010 - Crear Usuarios desde Admin
 */

import { useState, useEffect, type ReactElement, type FormEvent } from 'react';
import { X, UserPlus, Mail, Building2, GraduationCap, Loader2, Copy, Check } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Modal } from '@shared/components/common/Modal';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateUserFormData {
  email: string;
  full_name: string;
  role: 'student' | 'admin_teacher';
  organization_id: string;
  classroom_id?: string;
  send_welcome_email: boolean;
}

export interface CreatedUserResult {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_name: string;
  status: 'pending' | 'active';
  temporary_password?: string;
  welcome_email_sent: boolean;
}

interface Organization {
  id: string;
  name: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => Promise<CreatedUserResult>;
  organizations: Organization[];
  isLoadingOrganizations?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  organizations,
  isLoadingOrganizations = false,
}: CreateUserModalProps): ReactElement | null {
  // Form state
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    full_name: '',
    role: 'student',
    organization_id: '',
    send_welcome_email: false, // Default: show password
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUserResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Note: ESC key, scroll lock, and focus trap are handled by Modal component

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        full_name: '',
        role: 'student',
        organization_id: organizations[0]?.id || '',
        send_welcome_email: false,
      });
      setError(null);
      setCreatedUser(null);
    }
  }, [isOpen, organizations]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await onSubmit(formData);
      setCreatedUser(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy password to clipboard
  const handleCopyPassword = async () => {
    if (createdUser?.temporary_password) {
      await navigator.clipboard.writeText(createdUser.temporary_password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setCreatedUser(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      animated
      size="lg"
      showCloseButton={false}
      overlayClassName="bg-black/60 backdrop-blur-sm"
      className="bg-detective-dark rounded-xl border border-detective-border shadow-2xl"
      contentClassName="custom"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-detective-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-detective-orange/20">
            <UserPlus className="h-5 w-5 text-detective-orange" />
          </div>
          <h2 id="create-user-modal-title" className="text-lg font-semibold text-white">
            {createdUser ? 'Usuario Creado' : 'Crear Nuevo Usuario'}
          </h2>
        </div>
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="p-2 rounded-lg hover:bg-detective-bg-secondary transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5 text-detective-text-secondary" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {createdUser ? (
          // Success state
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
              <p className="text-green-400 font-medium">Usuario creado exitosamente</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Email:</span>
                <span className="text-white">{createdUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Nombre:</span>
                <span className="text-white">{createdUser.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Rol:</span>
                <span className="text-white capitalize">{createdUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Organización:</span>
                <span className="text-white">{createdUser.organization_name}</span>
              </div>

              {createdUser.temporary_password && (
                <div className="mt-4 p-4 rounded-lg bg-detective-orange/20 border border-detective-orange/50">
                  <p className="text-detective-orange text-xs mb-2">Contraseña temporal:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-black/50 rounded text-white font-mono">
                      {createdUser.temporary_password}
                    </code>
                    <button
                      onClick={handleCopyPassword}
                      className="p-2 rounded-lg bg-detective-orange/30 hover:bg-detective-orange/50 transition-colors"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-detective-orange" />
                      )}
                    </button>
                  </div>
                  <p className="text-detective-text-secondary text-xs mt-2">
                    Comparte esta contraseña con el usuario. Deberá cambiarla en su primer inicio de sesión.
                  </p>
                </div>
              )}
            </div>

            <DetectiveButton
              variant="primary"
              onClick={handleClose}
              className="w-full mt-4"
            >
              Cerrar
            </DetectiveButton>
          </div>
        ) : (
          // Form
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-detective-text mb-1">
                <Mail className="inline h-4 w-4 mr-1" />
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@escuela.edu"
                className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text placeholder-detective-text-secondary focus:ring-2 focus:ring-detective-orange focus:border-transparent"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-detective-text mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Juan Pérez García"
                className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text placeholder-detective-text-secondary focus:ring-2 focus:ring-detective-orange focus:border-transparent"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-detective-text mb-1">
                <GraduationCap className="inline h-4 w-4 mr-1" />
                Rol *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'admin_teacher' })}
                className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text focus:ring-2 focus:ring-detective-orange focus:border-transparent"
              >
                <option value="student">Estudiante</option>
                <option value="admin_teacher">Profesor</option>
              </select>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-detective-text mb-1">
                <Building2 className="inline h-4 w-4 mr-1" />
                Organización *
              </label>
              {isLoadingOrganizations ? (
                <div className="flex items-center gap-2 text-detective-text-secondary py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cargando organizaciones...</span>
                </div>
              ) : (
                <select
                  required
                  value={formData.organization_id}
                  onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                  className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text focus:ring-2 focus:ring-detective-orange focus:border-transparent"
                >
                  <option value="">Selecciona una organización</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Send welcome email checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="send_welcome_email"
                checked={formData.send_welcome_email}
                onChange={(e) => setFormData({ ...formData, send_welcome_email: e.target.checked })}
                className="w-4 h-4 rounded border-detective-border bg-detective-card text-detective-orange focus:ring-detective-orange"
              />
              <label htmlFor="send_welcome_email" className="text-sm text-detective-text">
                Enviar email de bienvenida con credenciales
              </label>
            </div>

            {!formData.send_welcome_email && (
              <p className="text-xs text-detective-text-secondary">
                Se generará una contraseña temporal que deberás compartir manualmente con el usuario.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <DetectiveButton
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </DetectiveButton>
              <DetectiveButton
                type="submit"
                variant="primary"
                disabled={isSubmitting || !formData.organization_id}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </>
                )}
              </DetectiveButton>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default CreateUserModal;
