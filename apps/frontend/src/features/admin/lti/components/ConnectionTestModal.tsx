/**
 * ConnectionTestModal Component
 *
 * Modal for testing LTI consumer connection.
 * Shows test progress and results.
 *
 * @module features/admin/lti/components/ConnectionTestModal
 * @see ET-LTI-001-integration.md
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { LtiConsumer, ConnectionTestResult } from '@/shared/types/lti.types';

interface ConnectionTestModalProps {
  /** The LTI consumer to test */
  consumer: LtiConsumer | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback to run the connection test */
  onTest: (id: string) => Promise<ConnectionTestResult>;
  /** Whether a test is currently running */
  isTesting: boolean;
}

interface TestStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

/**
 * Test step indicator component
 */
function TestStepItem({ step }: { step: TestStep }) {
  const getIcon = () => {
    switch (step.status) {
      case 'pending':
        return <div className="h-4 w-4 rounded-full border-2 border-detective-border" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-detective-orange" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTextColor = () => {
    switch (step.status) {
      case 'pending':
        return 'text-detective-text-secondary';
      case 'running':
        return 'text-detective-orange';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
      <div>
        <p className={`text-sm font-medium ${getTextColor()}`}>{step.label}</p>
        {step.message && (
          <p className="mt-0.5 text-xs text-detective-text-secondary">{step.message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * ConnectionTestModal Component
 */
export function ConnectionTestModal({
  consumer,
  isOpen,
  onClose,
  onTest,
  isTesting,
}: ConnectionTestModalProps) {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  // Reset state when modal opens/closes or consumer changes
  useEffect(() => {
    if (isOpen && consumer) {
      setTestResult(null);
      setHasStarted(false);
      setTestSteps([
        { id: 'init', label: 'Initializing test...', status: 'pending' },
        { id: 'jwks', label: 'Fetching public keys (JWKS)', status: 'pending' },
        { id: 'auth', label: 'Validating authorization endpoint', status: 'pending' },
        { id: 'token', label: 'Testing token endpoint', status: 'pending' },
        { id: 'complete', label: 'Connection verified', status: 'pending' },
      ]);
    }
  }, [isOpen, consumer]);

  const runTest = async () => {
    if (!consumer) return;

    setHasStarted(true);
    setTestResult(null);

    // Simulate step progression
    const updateStep = (stepId: string, status: TestStep['status'], message?: string) => {
      setTestSteps((prev) =>
        prev.map((step) => (step.id === stepId ? { ...step, status, message } : step))
      );
    };

    // Start init
    updateStep('init', 'running');
    await new Promise((r) => setTimeout(r, 300));
    updateStep('init', 'success', 'Test configuration loaded');

    // Start JWKS
    updateStep('jwks', 'running');
    await new Promise((r) => setTimeout(r, 500));

    try {
      const result = await onTest(consumer.id);
      setTestResult(result);

      if (result.success) {
        updateStep('jwks', 'success', 'Public keys fetched successfully');
        updateStep('auth', 'success', 'Authorization endpoint accessible');
        updateStep('token', 'success', 'Token endpoint responding');
        updateStep(
          'complete',
          'success',
          result.responseTimeMs ? `Completed in ${result.responseTimeMs}ms` : 'All checks passed'
        );
      } else {
        updateStep('jwks', 'error', result.error || 'Connection failed');
        updateStep('auth', 'pending');
        updateStep('token', 'pending');
        updateStep('complete', 'pending');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateStep('jwks', 'error', errorMessage);
      setTestResult({
        success: false,
        message: 'Connection test failed',
        error: errorMessage,
        testedAt: new Date().toISOString(),
      });
    }
  };

  if (!isOpen || !consumer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-detective-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-detective-border px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-detective-text">Connection Test</h2>
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
        <div className="p-6">
          {!hasStarted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-detective-orange/20">
                <RefreshCw className="h-8 w-8 text-detective-orange" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-detective-text">
                Ready to Test Connection
              </h3>
              <p className="mb-6 text-sm text-detective-text-secondary">
                This will verify the LTI configuration by testing the JWKS, authorization, and
                token endpoints.
              </p>
              <DetectiveButton variant="primary" onClick={runTest} disabled={isTesting}>
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Start Test
                  </>
                )}
              </DetectiveButton>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Test Steps */}
              <div className="space-y-4">
                {testSteps.map((step) => (
                  <TestStepItem key={step.id} step={step} />
                ))}
              </div>

              {/* Result Summary */}
              {testResult && (
                <DetectiveCard
                  className={
                    testResult.success
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-red-500/30 bg-red-500/10'
                  }
                >
                  <div className="flex items-start gap-3">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          testResult.success ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {testResult.success
                          ? 'Connection Successful'
                          : 'Connection Failed'}
                      </p>
                      <p className="mt-1 text-sm text-detective-text-secondary">
                        {testResult.message}
                      </p>
                      {testResult.responseTimeMs && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-detective-text-secondary">
                          <Clock className="h-3 w-3" />
                          Response time: {testResult.responseTimeMs}ms
                        </div>
                      )}
                    </div>
                  </div>
                </DetectiveCard>
              )}

              {/* Retry Button */}
              {testResult && (
                <div className="flex justify-center">
                  <DetectiveButton
                    variant="secondary"
                    onClick={runTest}
                    disabled={isTesting}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Test Again
                  </DetectiveButton>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-detective-border px-6 py-4">
          <DetectiveButton variant="secondary" onClick={onClose} className="w-full">
            Close
          </DetectiveButton>
        </div>
      </div>
    </div>
  );
}

export default ConnectionTestModal;
