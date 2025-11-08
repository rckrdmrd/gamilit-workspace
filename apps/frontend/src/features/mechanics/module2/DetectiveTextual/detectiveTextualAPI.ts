/**
 * Detective Textual API - Mock AI service integration
 */

import { generateInferenceSuggestions, generateHint } from '../../shared/aiService';
import type { Investigation, DetectiveProgress, AIHint } from './detectiveTextualTypes';
import { mockInvestigation } from './detectiveTextualMockData';

export const fetchInvestigation = async (id: string): Promise<Investigation> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockInvestigation;
};

export const validateConnection = async (
  fromEvidenceId: string,
  toEvidenceId: string,
  relationship: string
): Promise<{ isCorrect: boolean; feedback: string; score: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const correctConnection = mockInvestigation.correctConnections.find(
    (c) =>
      (c.fromEvidenceId === fromEvidenceId && c.toEvidenceId === toEvidenceId) ||
      (c.fromEvidenceId === toEvidenceId && c.toEvidenceId === fromEvidenceId)
  );

  if (correctConnection) {
    return {
      isCorrect: true,
      feedback: '¡Excelente conexión! Has identificado una relación clave en la investigación.',
      score: 20,
    };
  }

  return {
    isCorrect: false,
    feedback: 'Esta conexión es interesante, pero no es fundamental para resolver el misterio.',
    score: 5,
  };
};

export const requestAIHint = async (progress: DetectiveProgress): Promise<AIHint> => {
  const hint = await generateHint('detective', progress.discoveredEvidence.length);

  return {
    id: `hint-${Date.now()}`,
    type: 'connection',
    message: hint,
    cost: 10,
    revealed: true,
  };
};

export const getAIInferences = async (discoveredEvidence: string[]) => {
  return generateInferenceSuggestions(discoveredEvidence);
};

export const submitSolution = async (
  progress: DetectiveProgress
): Promise<{ score: number; feedback: string; completed: boolean }> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const correctConnectionsFound = progress.connections.filter((c) =>
    mockInvestigation.correctConnections.some(
      (cc) =>
        (cc.fromEvidenceId === c.fromEvidenceId && cc.toEvidenceId === c.toEvidenceId) ||
        (cc.fromEvidenceId === c.toEvidenceId && cc.toEvidenceId === c.fromEvidenceId)
    )
  ).length;

  const connectionScore = (correctConnectionsFound / mockInvestigation.correctConnections.length) * 60;
  const evidenceScore = (progress.discoveredEvidence.length / mockInvestigation.availableEvidence.length) * 30;
  const hintPenalty = progress.hintsUsed * 2;
  const finalScore = Math.max(0, Math.min(100, connectionScore + evidenceScore - hintPenalty + 10));

  return {
    score: Math.round(finalScore),
    feedback:
      finalScore > 80
        ? '¡Detective experto! Has resuelto el misterio brillantemente.'
        : finalScore > 60
          ? 'Buen trabajo. Has identificado las conexiones principales.'
          : 'Revisa las evidencias cuidadosamente y busca más conexiones.',
    completed: finalScore > 50,
  };
};
