/**
 * NavigationPathViewer Component
 *
 * @description Visualiza el camino de navegacion hipertextual que siguio
 * un estudiante durante el ejercicio de navegacion_hipertextual (M4).
 * Permite al docente evaluar la eficiencia y relevancia de las decisiones.
 *
 * @module shared/components/media/NavigationPathViewer
 * @since CORR-009
 */

import { useState } from 'react';

/**
 * Representa un paso en el camino de navegacion
 */
export interface NavigationStep {
  /** ID unico del paso */
  id: string;
  /** URL o pagina visitada */
  url: string;
  /** Titulo de la pagina */
  title: string;
  /** Tiempo en segundos que el usuario paso en esta pagina */
  timeSpent: number;
  /** Timestamp de cuando se visito */
  timestamp: Date | string;
  /** Si este paso fue relevante para la tarea */
  isRelevant?: boolean;
  /** Notas o respuesta del estudiante en esta pagina */
  notes?: string;
  /** Enlaces disponibles en esta pagina que no se siguieron */
  availableLinks?: string[];
  /** Enlace que se siguio desde esta pagina */
  followedLink?: string;
}

export interface NavigationPathViewerProps {
  /** Lista de pasos de navegacion en orden */
  steps: NavigationStep[];
  /** Pregunta de investigacion original */
  researchQuestion?: string;
  /** Respuesta final del estudiante */
  finalAnswer?: string;
  /** Tiempo total de la navegacion en segundos */
  totalTime?: number;
  /** Ruta optima esperada (para comparacion) */
  optimalPath?: string[];
  /** Callback cuando se selecciona un paso */
  onStepSelect?: (step: NavigationStep) => void;
  /** Modo solo lectura */
  readOnly?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Formatea segundos a minutos:segundos
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Extrae el dominio de una URL
 */
const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
};

export const NavigationPathViewer = ({
  steps,
  researchQuestion,
  finalAnswer,
  totalTime,
  optimalPath,
  onStepSelect,
  readOnly: _readOnly = true,
  className = '',
}: NavigationPathViewerProps) => {
  const [selectedStep, setSelectedStep] = useState<NavigationStep | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'tree'>('timeline');

  const handleStepClick = (step: NavigationStep) => {
    setSelectedStep(step);
    onStepSelect?.(step);
  };

  // Calculate path efficiency
  const pathEfficiency = optimalPath
    ? Math.round((optimalPath.length / steps.length) * 100)
    : null;

  // Calculate total time spent if not provided
  const calculatedTotalTime = totalTime || steps.reduce((sum, s) => sum + s.timeSpent, 0);

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Camino de Navegacion
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'timeline'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Linea de Tiempo
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'tree'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Arbol
            </button>
          </div>
        </div>

        {/* Research question */}
        {researchQuestion && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-600 font-medium mb-1">Pregunta de Investigacion</div>
            <div className="text-sm text-gray-800">{researchQuestion}</div>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-gray-600">{steps.length} paginas visitadas</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">{formatTime(calculatedTotalTime)} total</span>
          </div>
          {pathEfficiency !== null && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className={`${pathEfficiency >= 80 ? 'text-green-600' : pathEfficiency >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {pathEfficiency}% eficiencia
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Path visualization */}
      <div className="p-4">
        {viewMode === 'timeline' ? (
          <div className="space-y-0">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
                )}

                {/* Step */}
                <div
                  className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedStep?.id === step.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleStepClick(step)}
                >
                  {/* Step number */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.isRelevant === true
                        ? 'bg-green-500 text-white'
                        : step.isRelevant === false
                        ? 'bg-red-400 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 truncate">{step.title}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTime(step.timeSpent)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{extractDomain(step.url)}</div>
                    {step.notes && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {step.notes}
                      </div>
                    )}
                  </div>

                  {/* Relevance indicator */}
                  {step.isRelevant !== undefined && (
                    <div className="flex-shrink-0">
                      {step.isRelevant ? (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tree view - simplified representation */
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`relative px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                  selectedStep?.id === step.id
                    ? 'bg-blue-100 border-blue-300'
                    : step.isRelevant === true
                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                    : step.isRelevant === false
                    ? 'bg-red-50 border-red-200 hover:bg-red-100'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handleStepClick(step)}
              >
                <div className="text-xs text-gray-500 mb-1">#{index + 1}</div>
                <div className="text-sm font-medium text-gray-800 truncate max-w-32">{step.title}</div>
                <div className="text-xs text-gray-400">{formatTime(step.timeSpent)}</div>
                {/* Arrow to next */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-gray-300">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Final answer */}
      {finalAnswer && (
        <div className="p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-500 font-medium mb-2">Respuesta Final del Estudiante</div>
          <div className="p-3 bg-white rounded-lg border text-sm text-gray-700">
            {finalAnswer}
          </div>
        </div>
      )}

      {/* Selected step detail panel */}
      {selectedStep && (
        <div className="p-4 border-t bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Detalle del Paso</h4>
            <button
              onClick={() => setSelectedStep(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Titulo:</span>{' '}
              <span className="text-gray-800">{selectedStep.title}</span>
            </div>
            <div>
              <span className="text-gray-500">URL:</span>{' '}
              <a href={selectedStep.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {selectedStep.url}
              </a>
            </div>
            <div>
              <span className="text-gray-500">Tiempo en pagina:</span>{' '}
              <span className="text-gray-800">{formatTime(selectedStep.timeSpent)}</span>
            </div>
            {selectedStep.availableLinks && selectedStep.availableLinks.length > 0 && (
              <div>
                <span className="text-gray-500">Enlaces disponibles:</span>
                <ul className="mt-1 list-disc list-inside text-gray-600">
                  {selectedStep.availableLinks.map((link, i) => (
                    <li key={i} className={link === selectedStep.followedLink ? 'text-blue-600 font-medium' : ''}>
                      {link} {link === selectedStep.followedLink && '(elegido)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedStep.notes && (
              <div>
                <span className="text-gray-500">Notas del estudiante:</span>
                <p className="mt-1 text-gray-800 bg-white p-2 rounded border">{selectedStep.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationPathViewer;
