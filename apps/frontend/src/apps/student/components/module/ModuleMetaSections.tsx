/**
 * ModuleMetaSections - Optional metadata sections for the module detail page.
 *
 * Renders learning objectives, competencies, skills, prerequisites,
 * and rango maya sections when data is present.
 *
 * @module apps/student/components/module/ModuleMetaSections
 */

import {
  Target,
  Lightbulb,
  Award,
  Brain,
  Shield,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { EnhancedCard } from '@shared/components/base/EnhancedCard';

interface ModuleMetaSectionsProps {
  module: {
    learning_objectives?: string[];
    competencies?: string[];
    skills_developed?: string[];
    prerequisites?: string[];
    rangoMayaRequired?: string;
    rangoMayaGranted?: string;
    [key: string]: unknown;
  };
}

export function ModuleMetaSections({ module }: ModuleMetaSectionsProps) {
  const learningObjectives = Array.isArray(module.learning_objectives)
    ? module.learning_objectives
    : [];
  const competencies = Array.isArray(module.competencies) ? module.competencies : [];
  const skillsDeveloped = Array.isArray(module.skills_developed) ? module.skills_developed : [];
  const prerequisites = Array.isArray(module.prerequisites) ? module.prerequisites : [];

  return (
    <>
      {/* Learning Objectives */}
      {learningObjectives.length > 0 && (
        <EnhancedCard variant="info" padding="sm" hover={false} className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-detective-text">
            <Target className="h-4 w-4 text-detective-orange" />
            Objetivos de Aprendizaje
          </h2>
          <ul className="space-y-2">
            {learningObjectives.map((objective, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-detective-gold" />
                <span className="text-sm text-detective-text-secondary">{objective}</span>
              </li>
            ))}
          </ul>
        </EnhancedCard>
      )}

      {/* Competencies and Skills */}
      {(competencies.length > 0 || skillsDeveloped.length > 0) && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {competencies.length > 0 && (
            <EnhancedCard variant="default" hover={false} padding="sm" className="lg:col-span-2">
              <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-detective-text">
                <Award className="h-4 w-4 text-detective-blue" />
                Competencias
              </h2>
              <ul className="space-y-1.5">
                {competencies.map((competency, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-sm text-detective-blue">{'\u2022'}</span>
                    <span className="text-xs text-detective-text-secondary">{competency}</span>
                  </li>
                ))}
              </ul>
            </EnhancedCard>
          )}

          {skillsDeveloped.length > 0 && (
            <EnhancedCard variant="default" hover={false} padding="sm" className="lg:col-span-2">
              <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-detective-text">
                <Brain className="text-detective-purple h-4 w-4" />
                Habilidades Desarrolladas
              </h2>
              <ul className="space-y-1.5">
                {skillsDeveloped.map((skill, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-detective-purple mt-0.5 text-sm">{'\u2022'}</span>
                    <span className="text-xs text-detective-text-secondary">{skill}</span>
                  </li>
                ))}
              </ul>
            </EnhancedCard>
          )}
        </div>
      )}

      {/* Prerequisites */}
      {prerequisites.length > 0 && (
        <EnhancedCard variant="warning" hover={false} padding="sm" className="mb-6">
          <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-detective-text">
            <Shield className="h-4 w-4 text-detective-blue" />
            Requisitos Previos
          </h2>
          <ul className="space-y-1.5">
            {prerequisites.map((prerequisite, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-detective-blue" />
                <span className="text-xs text-detective-text-secondary">{prerequisite}</span>
              </li>
            ))}
          </ul>
        </EnhancedCard>
      )}

      {/* Rango Maya */}
      {(module.rangoMayaRequired || module.rangoMayaGranted) && (
        <EnhancedCard
          variant="default"
          hover={false}
          padding="sm"
          className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {module.rangoMayaRequired && (
              <div>
                <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-detective-text">
                  <Shield className="h-4 w-4 text-amber-600" />
                  Rango Requerido
                </h3>
                <p className="text-lg font-bold capitalize text-amber-700">
                  {module.rangoMayaRequired}
                </p>
              </div>
            )}
            {module.rangoMayaGranted && (
              <div>
                <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-detective-text">
                  <Zap className="h-4 w-4 text-orange-600" />
                  Rango Otorgado
                </h3>
                <p className="text-lg font-bold capitalize text-orange-700">
                  {module.rangoMayaGranted}
                </p>
              </div>
            )}
          </div>
        </EnhancedCard>
      )}
    </>
  );
}
