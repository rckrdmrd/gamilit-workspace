import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertTriangle, Send } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { ExerciseProps, EmailFormalState, ToneAnalysis, EmailTemplate } from './emailFormalTypes';
import { FeedbackData, normalizeProgressUpdate } from '@shared/components/mechanics/mechanicsTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';

export const EmailFormalExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onProgressUpdate,
  initialData,
  exercise,
}) => {
  // State management
  const [to, setTo] = useState(initialData?.to || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [analysis, setAnalysis] = useState<ToneAnalysis | null>(initialData?.analysis || null);

  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback] = useState<FeedbackData | null>(null);

  const templates: EmailTemplate[] = exercise?.templates || [
    {
      id: '1',
      name: 'Solicitud de Información',
      greeting: 'Estimado/a',
      purpose: 'Solicitar información sobre Marie Curie',
      template: {},
    },
    {
      id: '2',
      name: 'Agradecimiento Formal',
      greeting: 'Distinguido/a',
      purpose: 'Agradecer una conferencia científica',
      template: {},
    },
    {
      id: '3',
      name: 'Invitación Académica',
      greeting: 'Apreciado/a',
      purpose: 'Invitar a evento sobre mujeres en ciencia',
      template: {},
    },
  ];

  // Calculate progress
  const calculateProgress = () => {
    let progress = 0;
    if (to && to.includes('@')) progress += 15;
    if (subject.length >= 5) progress += 15;
    if (body.length >= 50) progress += 40;
    if (analysis) progress += 30;
    return Math.min(progress, 100);
  };

  // Progress tracking
  useEffect(() => {
    const progress = calculateProgress();
    onProgressUpdate?.(normalizeProgressUpdate(progress, 0, 1, 0, 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, subject, body, analysis]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const currentState: EmailFormalState = {
        to,
        subject,
        body,
        analysis,
      };
      saveProgressUtil(exerciseId, currentState);
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [to, subject, body, analysis, exerciseId]);

  // Analyze tone
  const analyzeTone = () => {
    const formalWords = ['estimado', 'cordialmente', 'atentamente', 'distinguido', 'apreciado'];
    const formalityScore =
      formalWords.filter(
        (word) => body.toLowerCase().includes(word) || subject.toLowerCase().includes(word),
      ).length * 20;

    const hasGreeting = /^(estimado|distinguido|apreciado)/i.test(body);
    const hasClosing = /(atentamente|cordialmente|saludos cordiales)/i.test(body);

    const suggestions: string[] = [];
    if (!hasGreeting) suggestions.push('Añade un saludo formal al inicio');
    if (!hasClosing) suggestions.push('Incluye un cierre formal');
    if (subject.length < 5) suggestions.push('El asunto debe ser más descriptivo');
    if (!to.includes('@')) suggestions.push('Verifica la dirección de correo');

    const newAnalysis = {
      formality: Math.min(formalityScore, 100),
      clarity: body.length > 50 ? 85 : 60,
      professionalism: hasGreeting && hasClosing ? 90 : 70,
      suggestions,
    };

    setAnalysis(newAnalysis);
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(`${template.purpose}`);
      setBody(
        `${template.greeting} Dr./Dra.,\n\n[Escribe tu mensaje aquí]\n\nAtentamente,\n[Tu nombre]`,
      );
    }
  };

  const getMetricColor = (score: number) => {
    if (score >= 80) return 'text-detective-success';
    if (score >= 60) return 'text-detective-gold';
    return 'text-detective-danger';
  };

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <div className="space-y-6">
          {/* Exercise Description */}
          <div className="rounded-detective bg-gradient-to-r from-detective-blue to-detective-orange p-6 text-white shadow-detective-lg">
            <div className="mb-2 flex items-center gap-3">
              <Mail className="h-8 w-8" />
              <h2 className="text-detective-2xl font-bold">Redacción de Email Formal</h2>
            </div>
            <p className="text-detective-base opacity-90">
              Redacta un correo formal relacionado con Marie Curie y su legado científico.
            </p>
          </div>
          {/* Templates Card */}
          <DetectiveCard variant="default" padding="lg">
            <label className="mb-3 block font-medium text-detective-text">Plantillas:</label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {templates.map((template) => (
                <motion.div key={template.id} whileHover={{ scale: 1.02 }}>
                  <DetectiveButton
                    variant="secondary"
                    onClick={() => applyTemplate(template.id)}
                    className="h-auto w-full p-3 text-left"
                  >
                    <p className="text-sm font-medium text-detective-text">{template.name}</p>
                    <p className="mt-1 text-xs text-detective-text-secondary">{template.purpose}</p>
                  </DetectiveButton>
                </motion.div>
              ))}
            </div>
          </DetectiveCard>

          {/* Email Form Card */}
          <DetectiveCard variant="default" padding="lg">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-medium text-detective-text">Para:</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="destinatario@universidad.edu"
                  className="w-full rounded-detective border-2 border-detective-border-medium px-4 py-2 transition-colors focus:border-detective-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-detective-text">Asunto:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Consulta sobre investigaciones de Marie Curie"
                  className="w-full rounded-detective border-2 border-detective-border-medium px-4 py-2 transition-colors focus:border-detective-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-detective-text">
                  Cuerpo del mensaje:
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  placeholder="Escribe tu mensaje formal aquí..."
                  className="w-full resize-none rounded-detective border-2 border-detective-border-medium px-4 py-2 transition-colors focus:border-detective-orange focus:outline-none"
                />
                <p className="mt-1 text-sm text-detective-text-secondary">
                  {body.length} caracteres
                </p>
              </div>

              <DetectiveButton
                variant="primary"
                onClick={analyzeTone}
                className="w-full"
                icon={<Send className="h-5 w-5" />}
              >
                Analizar Tono y Formalidad
              </DetectiveButton>
            </div>
          </DetectiveCard>

          {/* Analysis Results Card */}
          {analysis && (
            <DetectiveCard variant="default" padding="lg">
              <h3 className="mb-4 text-detective-xl font-bold text-detective-text">
                Análisis del Email
              </h3>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-sm text-detective-text-secondary">Formalidad</p>
                  <div className="relative">
                    <p className={`mb-2 text-3xl font-bold ${getMetricColor(analysis.formality)}`}>
                      {analysis.formality}%
                    </p>
                    <div className="flex h-2 overflow-hidden rounded bg-gray-200 text-xs">
                      <div
                        style={{ width: `${analysis.formality}%` }}
                        className="bg-detective-blue transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm text-detective-text-secondary">Claridad</p>
                  <div className="relative">
                    <p className={`mb-2 text-3xl font-bold ${getMetricColor(analysis.clarity)}`}>
                      {analysis.clarity}%
                    </p>
                    <div className="flex h-2 overflow-hidden rounded bg-gray-200 text-xs">
                      <div
                        style={{ width: `${analysis.clarity}%` }}
                        className="bg-detective-gold transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm text-detective-text-secondary">Profesionalismo</p>
                  <div className="relative">
                    <p
                      className={`mb-2 text-3xl font-bold ${getMetricColor(analysis.professionalism)}`}
                    >
                      {analysis.professionalism}%
                    </p>
                    <div className="flex h-2 overflow-hidden rounded bg-gray-200 text-xs">
                      <div
                        style={{ width: `${analysis.professionalism}%` }}
                        className="bg-detective-orange transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {analysis.suggestions.length > 0 && (
                <div className="rounded-detective border-2 border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-yellow-600" />
                    <div>
                      <p className="mb-2 font-medium text-detective-text">Sugerencias de mejora:</p>
                      <ul className="list-inside list-disc space-y-1">
                        {analysis.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-detective-text-secondary">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {analysis.suggestions.length === 0 && (
                <div className="rounded-detective border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <p className="font-medium text-green-800">
                      ¡Excelente! Tu email cumple con los estándares formales.
                    </p>
                  </div>
                </div>
              )}
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
              const avgScore = analysis
                ? Math.round((analysis.formality + analysis.clarity + analysis.professionalism) / 3)
                : 0;
              onComplete(avgScore, timeSpent);
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
