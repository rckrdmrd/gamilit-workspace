/**
 * LtiConsumerForm Component
 *
 * Form for creating and editing LTI consumers.
 * Validates URLs and provides a comprehensive interface for LTI configuration.
 *
 * @module features/admin/lti/components/LtiConsumerForm
 * @see ET-LTI-001-integration.md
 */

import { useEffect } from 'react';
import type { ElementType, ReactNode } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { X, Save, Loader2, Info, Link2, Settings, Shield } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { LtiConsumer, CreateLtiConsumerDto } from '@/shared/types/lti.types';

interface LtiConsumerFormProps {
  /** Consumer to edit (null for create mode) */
  consumer: LtiConsumer | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when form is submitted */
  onSubmit: (data: CreateLtiConsumerDto) => Promise<void>;
  /** Whether form is submitting */
  isSubmitting: boolean;
}

/**
 * Form section component for organization
 */
function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-detective-border pb-2">
        <Icon className="h-4 w-4 text-detective-orange" />
        <h4 className="text-sm font-medium text-detective-text">{title}</h4>
      </div>
      {children}
    </div>
  );
}

/**
 * Form input component with label and error display
 */
function FormInput({
  label,
  name,
  register,
  error,
  required = false,
  type = 'text',
  placeholder,
  helpText,
}: {
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  helpText?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-detective-text">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        {...register}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-detective-bg-secondary px-3 py-2 text-detective-text placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-detective-orange/50 ${
          error ? 'border-red-500' : 'border-detective-border'
        }`}
      />
      {helpText && !error && (
        <p className="mt-1 text-xs text-detective-text-secondary">{helpText}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/**
 * Toggle switch component
 */
function FormToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`h-5 w-9 rounded-full transition-colors ${
            checked ? 'bg-detective-orange' : 'bg-detective-border'
          }`}
        >
          <div
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
              checked ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>
      <div className="flex-1">
        <span className="block text-sm font-medium text-detective-text">{label}</span>
        <span className="block text-xs text-detective-text-secondary">{description}</span>
      </div>
    </label>
  );
}

/**
 * LtiConsumerForm Component
 */
export function LtiConsumerForm({
  consumer,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: LtiConsumerFormProps) {
  const isEditMode = !!consumer;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateLtiConsumerDto>({
    defaultValues: {
      platformId: '',
      clientId: '',
      deploymentId: '',
      publicKeysetUrl: '',
      accessTokenUrl: '',
      authorizationUrl: '',
      platformName: '',
      platformVersion: '',
      platformContactEmail: '',
      supportsDeepLinking: false,
      supportsNrps: false,
      supportsAgs: false,
    },
  });

  // Watch toggle values
  const supportsDeepLinking = watch('supportsDeepLinking');
  const supportsNrps = watch('supportsNrps');
  const supportsAgs = watch('supportsAgs');

  // Reset form when consumer changes or modal opens
  useEffect(() => {
    if (isOpen && consumer) {
      reset({
        platformId: consumer.platformId,
        clientId: consumer.clientId,
        deploymentId: consumer.deploymentId || '',
        publicKeysetUrl: consumer.publicKeysetUrl,
        accessTokenUrl: consumer.accessTokenUrl,
        authorizationUrl: consumer.authorizationUrl,
        platformName: consumer.platformName,
        platformVersion: consumer.platformVersion || '',
        platformContactEmail: consumer.platformContactEmail || '',
        supportsDeepLinking: consumer.supportsDeepLinking,
        supportsNrps: consumer.supportsNrps,
        supportsAgs: consumer.supportsAgs,
      });
    } else if (isOpen && !consumer) {
      reset({
        platformId: '',
        clientId: '',
        deploymentId: '',
        publicKeysetUrl: '',
        accessTokenUrl: '',
        authorizationUrl: '',
        platformName: '',
        platformVersion: '',
        platformContactEmail: '',
        supportsDeepLinking: false,
        supportsNrps: false,
        supportsAgs: false,
      });
    }
  }, [isOpen, consumer, reset]);

  const handleFormSubmit = async (data: CreateLtiConsumerDto) => {
    await onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="lg" className="bg-detective-card p-0">
      <div className="-mx-6 -my-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-detective-border bg-detective-card px-6 py-4">
          <h2 className="text-xl font-semibold text-detective-text">
            {isEditMode ? 'Edit LTI Consumer' : 'Add LTI Consumer'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-detective-text-secondary hover:bg-detective-bg-secondary hover:text-detective-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-6">
          {/* Platform Information */}
          <FormSection title="Platform Information" icon={Info}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormInput
                  label="Platform Name"
                  name="platformName"
                  register={register('platformName', {
                    required: 'Platform name is required',
                    maxLength: { value: 100, message: 'Maximum 100 characters' },
                  })}
                  error={errors.platformName?.message}
                  required
                  placeholder="Canvas UAM Xochimilco"
                  helpText="Human-readable name for this LMS"
                />
              </div>
              <FormInput
                label="Platform Version"
                name="platformVersion"
                register={register('platformVersion')}
                placeholder="2024.01"
                helpText="LMS version (optional)"
              />
              <FormInput
                label="Contact Email"
                name="platformContactEmail"
                register={register('platformContactEmail', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.platformContactEmail?.message}
                type="email"
                placeholder="admin@university.edu"
                helpText="LMS administrator email"
              />
            </div>
          </FormSection>

          {/* LTI Configuration */}
          <FormSection title="LTI 1.3 Configuration" icon={Link2}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormInput
                  label="Platform ID (Issuer)"
                  name="platformId"
                  register={register('platformId', {
                    required: 'Platform ID is required',
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: 'Must be a valid URL',
                    },
                  })}
                  error={errors.platformId?.message}
                  required
                  placeholder="https://canvas.instructure.com"
                  helpText="The issuer identifier from your LMS"
                />
              </div>
              <FormInput
                label="Client ID"
                name="clientId"
                register={register('clientId', {
                  required: 'Client ID is required',
                })}
                error={errors.clientId?.message}
                required
                placeholder="10000000000001"
                helpText="OAuth2 client_id from LMS"
              />
              <FormInput
                label="Deployment ID"
                name="deploymentId"
                register={register('deploymentId')}
                placeholder="1:abc123"
                helpText="Required for multi-deployment"
              />
            </div>
          </FormSection>

          {/* OAuth 2.0 URLs */}
          <FormSection title="OAuth 2.0 / OIDC URLs" icon={Settings}>
            <div className="space-y-4">
              <FormInput
                label="Public Keyset URL (JWKS)"
                name="publicKeysetUrl"
                register={register('publicKeysetUrl', {
                  required: 'JWKS URL is required',
                  pattern: {
                    value: /^https:\/\/.+/i,
                    message: 'Must be a valid HTTPS URL',
                  },
                })}
                error={errors.publicKeysetUrl?.message}
                required
                placeholder="https://canvas.instructure.com/api/lti/security/jwks"
                helpText="URL for LMS public keys (for token validation)"
              />
              <FormInput
                label="Access Token URL"
                name="accessTokenUrl"
                register={register('accessTokenUrl', {
                  required: 'Access Token URL is required',
                  pattern: {
                    value: /^https:\/\/.+/i,
                    message: 'Must be a valid HTTPS URL',
                  },
                })}
                error={errors.accessTokenUrl?.message}
                required
                placeholder="https://canvas.instructure.com/login/oauth2/token"
                helpText="OAuth2 token endpoint"
              />
              <FormInput
                label="Authorization URL"
                name="authorizationUrl"
                register={register('authorizationUrl', {
                  required: 'Authorization URL is required',
                  pattern: {
                    value: /^https:\/\/.+/i,
                    message: 'Must be a valid HTTPS URL',
                  },
                })}
                error={errors.authorizationUrl?.message}
                required
                placeholder="https://canvas.instructure.com/api/lti/authorize_redirect"
                helpText="OIDC authorization endpoint"
              />
            </div>
          </FormSection>

          {/* LTI Advantage Features */}
          <FormSection title="LTI Advantage Features" icon={Shield}>
            <div className="space-y-4">
              <FormToggle
                label="Deep Linking"
                description="Allow content selection within the LMS"
                checked={supportsDeepLinking ?? false}
                onChange={(checked) => setValue('supportsDeepLinking', checked)}
              />
              <FormToggle
                label="Names and Role Provisioning (NRPS)"
                description="Sync user roles and names from the LMS"
                checked={supportsNrps ?? false}
                onChange={(checked) => setValue('supportsNrps', checked)}
              />
              <FormToggle
                label="Assignment and Grade Services (AGS)"
                description="Send grades back to the LMS gradebook"
                checked={supportsAgs ?? false}
                onChange={(checked) => setValue('supportsAgs', checked)}
              />
            </div>
          </FormSection>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-detective-border pt-6">
            <DetectiveButton type="button" variant="secondary" onClick={onClose}>
              Cancel
            </DetectiveButton>
            <DetectiveButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Save Changes' : 'Create Consumer'}
                </>
              )}
            </DetectiveButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default LtiConsumerForm;
