/**
 * LtiCredentialsDisplay Component
 *
 * Modal for displaying LTI consumer credentials and configuration URLs.
 * Includes copy-to-clipboard functionality.
 *
 * @module features/admin/lti/components/LtiCredentialsDisplay
 * @see ET-LTI-001-integration.md
 */

import { useState } from 'react';
import { X, Copy, Check, RefreshCw, AlertTriangle, ExternalLink, Key } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { LtiConsumer, LtiCredentials } from '@/shared/types/lti.types';

interface LtiCredentialsDisplayProps {
  /** The LTI consumer to display credentials for */
  consumer: LtiConsumer | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback to regenerate legacy credentials */
  onRegenerateCredentials: (id: string) => Promise<LtiCredentials>;
  /** Whether credentials are being regenerated */
  isRegenerating: boolean;
}

/**
 * Credential field component with copy button
 */
function CredentialField({
  label,
  value,
  isSensitive = false,
  isUrl = false,
}: {
  label: string;
  value: string | null;
  isSensitive?: boolean;
  isUrl?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const displayValue = value || 'Not configured';
  const shouldMask = isSensitive && !revealed && value;

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-detective-text-secondary">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 overflow-hidden">
          {isUrl && value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded bg-detective-bg-secondary px-3 py-2 font-mono text-sm text-detective-orange hover:underline"
            >
              <span className="truncate">{displayValue}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          ) : (
            <code
              className={`block truncate rounded bg-detective-bg-secondary px-3 py-2 font-mono text-sm ${
                value ? 'text-detective-text' : 'text-detective-text-secondary italic'
              }`}
            >
              {shouldMask ? '••••••••••••••••' : displayValue}
            </code>
          )}
        </div>
        {isSensitive && value && (
          <button
            onClick={() => setRevealed(!revealed)}
            className="rounded-lg p-2 text-detective-text-secondary hover:bg-detective-bg-secondary hover:text-detective-text"
            title={revealed ? 'Hide' : 'Show'}
          >
            <Key className="h-4 w-4" />
          </button>
        )}
        {value && (
          <button
            onClick={handleCopy}
            className={`rounded-lg p-2 transition-colors ${
              copied
                ? 'bg-green-500/20 text-green-500'
                : 'text-detective-text-secondary hover:bg-detective-bg-secondary hover:text-detective-text'
            }`}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Section header component
 */
function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="mb-3 border-b border-detective-border pb-2 text-sm font-semibold text-detective-text">
      {title}
    </h4>
  );
}

/**
 * LtiCredentialsDisplay Component
 */
export function LtiCredentialsDisplay({
  consumer,
  isOpen,
  onClose,
  onRegenerateCredentials,
  isRegenerating,
}: LtiCredentialsDisplayProps) {
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [newCredentials, setNewCredentials] = useState<LtiCredentials | null>(null);

  if (!isOpen || !consumer) return null;

  const handleRegenerate = async () => {
    try {
      const credentials = await onRegenerateCredentials(consumer.id);
      setNewCredentials(credentials);
      setShowRegenerateConfirm(false);
    } catch (error) {
      console.error('Failed to regenerate credentials:', error);
    }
  };

  // Tool configuration URLs (would come from backend in real implementation)
  const toolConfig = {
    oidcLoginUrl: `${window.location.origin}/api/v1/lti/oidc/login`,
    launchUrl: `${window.location.origin}/api/v1/lti/launch`,
    jwksUrl: `${window.location.origin}/api/v1/lti/jwks`,
    deepLinkUrl: `${window.location.origin}/api/v1/lti/deep-link`,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="lg" className="bg-detective-card p-0">
      <div className="-mx-6 -my-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-detective-border bg-detective-card px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-detective-text">LTI Configuration</h2>
            <p className="text-sm text-detective-text-secondary">{consumer.platformName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-detective-text-secondary hover:bg-detective-bg-secondary hover:text-detective-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Tool Configuration (for LMS admin) */}
          <DetectiveCard>
            <SectionHeader title="Tool Configuration (for LMS)" />
            <p className="mb-4 text-sm text-detective-text-secondary">
              Use these URLs when configuring GAMILIT as an LTI tool in your LMS.
            </p>
            <div className="space-y-4">
              <CredentialField label="OIDC Login URL" value={toolConfig.oidcLoginUrl} isUrl />
              <CredentialField label="Launch URL" value={toolConfig.launchUrl} isUrl />
              <CredentialField label="JWKS URL (Public Keys)" value={toolConfig.jwksUrl} isUrl />
              <CredentialField label="Deep Link URL" value={toolConfig.deepLinkUrl} isUrl />
            </div>
          </DetectiveCard>

          {/* LMS Configuration (from LMS) */}
          <DetectiveCard>
            <SectionHeader title="LMS Configuration (from LMS)" />
            <div className="space-y-4">
              <CredentialField label="Platform ID (Issuer)" value={consumer.platformId} isUrl />
              <CredentialField label="Client ID" value={consumer.clientId} />
              <CredentialField label="Deployment ID" value={consumer.deploymentId} />
              <CredentialField
                label="Public Keyset URL (JWKS)"
                value={consumer.publicKeysetUrl}
                isUrl
              />
              <CredentialField
                label="Access Token URL"
                value={consumer.accessTokenUrl}
                isUrl
              />
              <CredentialField
                label="Authorization URL"
                value={consumer.authorizationUrl}
                isUrl
              />
            </div>
          </DetectiveCard>

          {/* Legacy Credentials (LTI 1.1) */}
          <DetectiveCard>
            <SectionHeader title="Legacy Credentials (LTI 1.1)" />
            <p className="mb-4 text-sm text-detective-text-secondary">
              These credentials are for legacy LTI 1.1 integrations only.
            </p>
            <div className="space-y-4">
              <CredentialField
                label="Consumer Key"
                value={newCredentials?.consumerKey || consumer.consumerKey}
              />
              <CredentialField
                label="Consumer Secret"
                value={newCredentials?.consumerSecret || consumer.consumerSecret}
                isSensitive
              />
            </div>

            {/* Regenerate Button */}
            <div className="mt-4 border-t border-detective-border pt-4">
              {showRegenerateConfirm ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                    <div className="text-sm text-yellow-500">
                      <p className="font-medium">Warning</p>
                      <p>
                        Regenerating credentials will invalidate any existing LTI 1.1 integrations
                        using the current credentials.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DetectiveButton
                      variant="secondary"
                      onClick={() => setShowRegenerateConfirm(false)}
                    >
                      Cancel
                    </DetectiveButton>
                    <DetectiveButton
                      variant="primary"
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                    >
                      {isRegenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Confirm Regenerate
                        </>
                      )}
                    </DetectiveButton>
                  </div>
                </div>
              ) : (
                <DetectiveButton
                  variant="secondary"
                  onClick={() => setShowRegenerateConfirm(true)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Legacy Credentials
                </DetectiveButton>
              )}
            </div>

            {/* New Credentials Alert */}
            {newCredentials && (
              <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                <p className="text-sm font-medium text-green-500">
                  New credentials generated successfully!
                </p>
                <p className="mt-1 text-xs text-green-400">
                  Generated at: {new Date(newCredentials.generatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </DetectiveCard>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-detective-border bg-detective-card px-6 py-4">
          <DetectiveButton variant="secondary" onClick={onClose} className="w-full">
            Close
          </DetectiveButton>
        </div>
      </div>
    </Modal>
  );
}

export default LtiCredentialsDisplay;
