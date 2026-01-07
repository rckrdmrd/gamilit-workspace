import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { ArticleParser } from './ArticleParser';
import { FactCheckDashboard } from './FactCheckDashboard';
import { mockArticles, mockFactCheckResults } from './verificadorFakeNewsMockData';
import {
  Claim,
  FactCheckResult,
  ExerciseProps,
  VerificadorState,
  NewsArticle,
} from './verificadorFakeNewsTypes';
import { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

export const VerificadorFakeNewsExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onProgressUpdate,
  initialData,
  exercise,
}) => {
  // State management
  const [selectedArticleId, setSelectedArticleId] = useState(
    initialData?.selectedArticleId || mockArticles[0].id,
  );
  const [claims, setClaims] = useState<Claim[]>(initialData?.claims || []);
  const [results, setResults] = useState<FactCheckResult[]>(initialData?.results || []);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // API submission hook
  const {
    submit,
    isSubmitting,
  } = useExerciseSubmission(exerciseId || '', {
    onSuccess: (result) => {
      setIsSubmitted(true);
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Verificar si está pendiente de revisión manual
      if (result.status === 'pending_review' || result.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Verificación Enviada',
          message: 'Tu análisis ha sido enviado para revisión del maestro. Recibirás tus recompensas cuando sea evaluado.',
          pendingReview: true,
        });
        setShowFeedback(true);
        onComplete?.(0, timeSpent);
        return;
      }

      // Flujo normal cuando ya está evaluado
      setFeedback({
        type: 'success',
        title: '¡Verificación Completada!',
        message: 'Tu análisis ha sido evaluado correctamente.',
        score: result.score,
        xpEarned: result.rewards?.xp || 0,
        mlCoinsEarned: result.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);
      onComplete?.(result.score, timeSpent);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: err?.message || 'Hubo un problema al enviar tu verificación. Intenta de nuevo.',
        score: 0,
      });
      setShowFeedback(true);
    },
  });

  const selectedArticle =
    exercise?.articles?.find((a: NewsArticle) => a.id === selectedArticleId) ||
    mockArticles.find((a: NewsArticle) => a.id === selectedArticleId);
  const articles = exercise?.articles || mockArticles;

  // Calculate score
  const calculateScore = () => {
    if (results.length === 0) return 0;

    const verifiedCount = results.length;
    const accurateVerifications = results.filter(
      (r) => r.verdict === 'true' || r.verdict === 'false',
    ).length;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    const verificationScore = (verifiedCount / Math.max(claims.length, 1)) * 40;
    const accuracyScore = (accurateVerifications / Math.max(verifiedCount, 1)) * 40;
    const confidenceScore = avgConfidence * 20;

    return Math.round(verificationScore + accuracyScore + confidenceScore);
  };

  // Progress tracking
  // FIX: Send answers in DTO format (claims_verified) for ExercisePage.tsx submit button
  useEffect(() => {
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const score = calculateScore();

    // Transform to DTO format (claims_verified) for backend validation
    const claims_verified = results.map((r) => {
      const originalClaim = claims.find((c) => c.id === r.claimId);
      return {
        claim_id: r.claimId,
        is_fake: r.verdict === 'false',
        evidence: r.explanation && r.explanation.length >= 10
          ? r.explanation
          : `Verificado: ${originalClaim?.text?.substring(0, 50) || 'Afirmación analizada'}. Confianza: ${Math.round(r.confidence * 100)}%`,
      };
    });

    onProgressUpdate?.({
      progress: {
        currentStep: results.length,
        totalSteps: Math.max(claims.length, 1),
        score,
        hintsUsed: 0,
        timeSpent,
      },
      answers: {
        // Primary format: DTO expected by backend (claims_verified)
        claims_verified,

        // Secondary format for backwards compatibility with validators
        verifiedClaims: results.map((r) => ({
          claim: claims.find((c) => c.id === r.claimId)?.text || '',
          verdict: r.verdict,
          evidence: r.explanation || `Confianza: ${Math.round(r.confidence * 100)}%`,
        })),

        // Metadata for context
        metadata: {
          selectedArticleId,
          claims: claims.map((c) => ({ id: c.id, text: c.text })),
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claims, results, selectedArticleId]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const currentState: VerificadorState = {
        selectedArticleId,
        claims,
        results,
      };
      saveProgressUtil(exerciseId || '', currentState);
    }, 30000); // Every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [selectedArticleId, claims, results, exerciseId]);

  // Handle claim extraction
  const handleClaimExtraction = (text: string, start: number, end: number) => {
    const contentLength = selectedArticle?.content?.length ?? 0;
    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      text,
      context:
        selectedArticle?.content?.slice(
          Math.max(0, start - 50),
          Math.min(contentLength, end + 50),
        ) || '',
      position: { start, end },
    };
    setClaims([...claims, newClaim]);
  };

  // Handle claim verification
  const handleVerifyClaim = async (claimId: string) => {
    // Mock API call - simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get mock results for this article
    const articleResults = mockFactCheckResults[selectedArticleId] || [];

    // Guard against empty array to prevent division by zero
    if (articleResults.length === 0) {
      console.warn('[VerificadorFakeNews] No mock results available for article:', selectedArticleId);
      return;
    }

    const mockResult = articleResults[results.length % articleResults.length];

    if (mockResult) {
      const newResult: FactCheckResult = {
        ...mockResult,
        claimId,
      };
      setResults([...results, newResult]);
    }
  };

  const highlightedClaims = claims.map((claim) => ({
    ...claim.position,
    verified: results.some((r) => r.claimId === claim.id),
  }));

  // Reset handler
  const handleReset = () => {
    setClaims([]);
    setResults([]);
    setFeedback(null);
    setShowFeedback(false);
    setIsSubmitted(false);
  };

  // Submit handler - sends to API for manual review
  // FIX: Transform data to match VerificadorFakeNewsAnswerDto expected by backend
  const handleSubmit = () => {
    if (!exerciseId || results.length === 0 || isSubmitting || isSubmitted) return;

    // Transform verificationResults to claims_verified format expected by DTO
    // DTO expects: { claims_verified: [{ claim_id, is_fake, evidence }] }
    const claims_verified = results.map((r) => {
      // Find the original claim to get its text for context
      const originalClaim = claims.find((c) => c.id === r.claimId);

      return {
        claim_id: r.claimId,
        // Convert verdict to is_fake boolean: 'false' verdict means IS fake news
        is_fake: r.verdict === 'false',
        // Use explanation as evidence, ensure min 10 chars
        evidence: r.explanation && r.explanation.length >= 10
          ? r.explanation
          : `Verificado: ${originalClaim?.text?.substring(0, 50) || 'Afirmación analizada'}. Confianza: ${Math.round(r.confidence * 100)}%`,
      };
    });

    // Build submission with both formats for backwards compatibility
    const submissionData = {
      // Primary format expected by VerificadorFakeNewsAnswerDto
      claims_verified,

      // Secondary format for exercise-validator.service.ts compatibility
      verifiedClaims: results.map((r) => ({
        claim: claims.find((c) => c.id === r.claimId)?.text || '',
        verdict: r.verdict,
        evidence: r.explanation || `Confianza: ${Math.round(r.confidence * 100)}%`,
      })),

      // Metadata for context (not validated but useful for manual review)
      metadata: {
        selectedArticleId,
        articleTitle: selectedArticle?.title || '',
        claims: claims.map((c) => ({
          id: c.id,
          text: c.text,
          context: c.context,
          position: c.position,
        })),
        summary: {
          totalClaims: claims.length,
          verifiedClaims: results.length,
          trueClaims: results.filter((r) => r.verdict === 'true').length,
          falseClaims: results.filter((r) => r.verdict === 'false').length,
          averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
        },
      },
    };

    submit(submissionData);
  };

  const canSubmit = results.length >= 3 && !isSubmitting && !isSubmitted;

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <div className="space-y-6">
          {/* Exercise Description */}
          <div className="rounded-xl bg-gradient-to-r from-blue-800 to-orange-500 p-6 text-white shadow-lg">
            <div className="mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <h2 className="text-detective-2xl font-bold">Verificador de Noticias Falsas</h2>
            </div>
            <p className="mb-4 text-detective-base opacity-90">
              Analiza artículos sobre Marie Curie y verifica la veracidad de las afirmaciones.
            </p>

            <div className="flex items-center gap-4">
              <label className="font-medium text-white">Selecciona un artículo:</label>
              <select
                value={selectedArticleId}
                onChange={(e) => {
                  setSelectedArticleId(e.target.value);
                  handleReset();
                }}
                className="rounded-detective border-2 border-white/30 bg-white/10 px-4 py-2 text-white transition-colors focus:border-white focus:outline-none"
              >
                {articles.map((article) => (
                  <option key={article.id} value={article.id} className="text-detective-text">
                    {article.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Content - Article and Dashboard */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {selectedArticle && (
              <ArticleParser
                article={selectedArticle}
                onClaimSelect={handleClaimExtraction}
                highlightedClaims={highlightedClaims}
              />
            )}
            <FactCheckDashboard
              claims={claims}
              results={results}
              onVerifyClaim={handleVerifyClaim}
            />
          </div>

          {/* Score Summary */}
          {results.length > 0 && (
            <DetectiveCard variant="default" padding="lg">
              <h3 className="mb-4 text-detective-2xl font-bold text-detective-text">
                Resumen de Verificación
              </h3>
              <p className="mb-4 text-detective-text-secondary">
                Has verificado {results.length} afirmación(es).
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-detective border-2 border-green-200 bg-green-50 p-4 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <p className="text-3xl font-bold text-green-600">
                      {results.filter((r) => r.verdict === 'true').length}
                    </p>
                  </div>
                  <p className="text-sm text-detective-text">Verdaderas</p>
                </div>
                <div className="rounded-detective border-2 border-red-200 bg-red-50 p-4 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <XCircle className="h-6 w-6 text-red-600" />
                    <p className="text-3xl font-bold text-red-600">
                      {results.filter((r) => r.verdict === 'false').length}
                    </p>
                  </div>
                  <p className="text-sm text-detective-text">Falsas</p>
                </div>
                <div className="rounded-detective border-2 border-blue-200 bg-blue-50 p-4 text-center">
                  <p className="mb-2 text-3xl font-bold text-detective-blue">
                    {Math.round(
                      (results.reduce((sum, r) => sum + r.confidence, 0) / results.length) * 100,
                    )}
                    %
                  </p>
                  <p className="text-sm text-detective-text">Confianza Promedio</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-detective-text-secondary">
                  {results.length < 3
                    ? `Verifica al menos 3 afirmaciones para enviar (${results.length}/3)`
                    : isSubmitted
                      ? '✓ Enviado para revisión'
                      : 'Listo para enviar'}
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`flex items-center gap-2 rounded-detective px-6 py-3 font-semibold transition-all ${
                    canSubmit
                      ? 'bg-gradient-to-r from-detective-blue to-detective-orange text-white shadow-detective hover:shadow-detective-lg'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Enviado
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Enviar Verificación
                    </>
                  )}
                </button>
              </div>
            </DetectiveCard>
          )}
        </div>
      </DetectiveCard>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success' && onComplete) {
              const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
              onComplete(calculateScore(), timeSpent);
            }
          }}
          onRetry={() => {
            setShowFeedback(false);
          }}
        />
      )}
    </>
  );
};

export default VerificadorFakeNewsExercise;
