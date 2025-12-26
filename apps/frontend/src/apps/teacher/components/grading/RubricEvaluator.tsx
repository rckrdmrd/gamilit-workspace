/**
 * RubricEvaluator Component
 *
 * P2-02: Created 2025-12-18
 * Standardized rubric-based evaluation component for manual grading mechanics.
 *
 * Features:
 * - Configurable rubric criteria with weight support
 * - Visual scoring interface with level descriptors
 * - Automatic weighted score calculation
 * - Feedback templates per criterion
 * - Support for 10 manual grading mechanics
 *
 * @component
 */

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Info,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Save,
  RotateCcw,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface RubricLevel {
  score: number;
  label: string;
  description: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage weight (0-100)
  levels: RubricLevel[];
  feedbackTemplates?: string[];
}

export interface RubricConfig {
  id: string;
  name: string;
  description: string;
  mechanicType: string;
  maxScore: number;
  criteria: RubricCriterion[];
}

export interface RubricScore {
  criterionId: string;
  selectedLevel: number;
  feedback?: string;
}

export interface RubricEvaluatorProps {
  rubric: RubricConfig;
  initialScores?: RubricScore[];
  onScoreChange?: (scores: RubricScore[], totalScore: number, percentage: number) => void;
  onSubmit?: (scores: RubricScore[], totalScore: number, feedback: string) => Promise<void>;
  readOnly?: boolean;
}

export interface RubricEvaluatorResult {
  scores: RubricScore[];
  totalScore: number;
  percentage: number;
  feedback: string;
}

// ============================================================================
// DEFAULT RUBRICS BY MECHANIC TYPE
// ============================================================================

export const DEFAULT_RUBRICS: Record<string, RubricConfig> = {
  prediccion_narrativa: {
    id: 'rubric-prediccion',
    name: 'Evaluaci\u00f3n de Predicci\u00f3n Narrativa',
    description: 'R\u00fabrica para evaluar predicciones narrativas basadas en el texto',
    mechanicType: 'prediccion_narrativa',
    maxScore: 100,
    criteria: [
      {
        id: 'coherencia',
        name: 'Coherencia con el texto',
        description: '\u00bfLa predicci\u00f3n es coherente con la informaci\u00f3n presentada en el texto?',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin relaci\u00f3n con el texto' },
          { score: 2, label: 'B\u00e1sico', description: 'Relaci\u00f3n m\u00ednima' },
          { score: 3, label: 'Competente', description: 'Relaci\u00f3n adecuada' },
          { score: 4, label: 'Avanzado', description: 'Relaci\u00f3n s\u00f3lida con evidencia' },
          { score: 5, label: 'Excelente', description: 'Fundamentaci\u00f3n excepcional' },
        ],
      },
      {
        id: 'creatividad',
        name: 'Creatividad',
        description: '\u00bfLa predicci\u00f3n muestra pensamiento original?',
        weight: 25,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Respuesta literal/copiada' },
          { score: 2, label: 'B\u00e1sico', description: 'Poca originalidad' },
          { score: 3, label: 'Competente', description: 'Algo de creatividad' },
          { score: 4, label: 'Avanzado', description: 'Ideas originales' },
          { score: 5, label: 'Excelente', description: 'Muy creativo e innovador' },
        ],
      },
      {
        id: 'justificacion',
        name: 'Justificaci\u00f3n',
        description: '\u00bfEl estudiante justifica su predicci\u00f3n adecuadamente?',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin justificaci\u00f3n' },
          { score: 2, label: 'B\u00e1sico', description: 'Justificaci\u00f3n vaga' },
          { score: 3, label: 'Competente', description: 'Justificaci\u00f3n aceptable' },
          { score: 4, label: 'Avanzado', description: 'Bien justificado con ejemplos' },
          { score: 5, label: 'Excelente', description: 'Argumentaci\u00f3n excepcional' },
        ],
      },
      {
        id: 'expresion',
        name: 'Expresi\u00f3n escrita',
        description: 'Claridad, gram\u00e1tica y ortograf\u00eda',
        weight: 15,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Muchos errores' },
          { score: 2, label: 'B\u00e1sico', description: 'Errores frecuentes' },
          { score: 3, label: 'Competente', description: 'Algunos errores' },
          { score: 4, label: 'Avanzado', description: 'Pocos errores' },
          { score: 5, label: 'Excelente', description: 'Escritura impecable' },
        ],
      },
    ],
  },
  tribunal_opiniones: {
    id: 'rubric-tribunal',
    name: 'Evaluaci\u00f3n de Tribunal de Opiniones',
    description: 'R\u00fabrica para evaluar argumentos en debates',
    mechanicType: 'tribunal_opiniones',
    maxScore: 100,
    criteria: [
      {
        id: 'argumentacion',
        name: 'Calidad argumentativa',
        description: 'Solidez y l\u00f3gica de los argumentos',
        weight: 35,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin argumentos claros' },
          { score: 2, label: 'B\u00e1sico', description: 'Argumentos d\u00e9biles' },
          { score: 3, label: 'Competente', description: 'Argumentos aceptables' },
          { score: 4, label: 'Avanzado', description: 'Argumentos s\u00f3lidos' },
          { score: 5, label: 'Excelente', description: 'Argumentaci\u00f3n excepcional' },
        ],
      },
      {
        id: 'evidencia',
        name: 'Uso de evidencia',
        description: 'Respaldo con datos o ejemplos del texto',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin evidencia' },
          { score: 2, label: 'B\u00e1sico', description: 'Evidencia irrelevante' },
          { score: 3, label: 'Competente', description: 'Alguna evidencia' },
          { score: 4, label: 'Avanzado', description: 'Buena evidencia' },
          { score: 5, label: 'Excelente', description: 'Evidencia excepcional' },
        ],
      },
      {
        id: 'contraargumentos',
        name: 'Manejo de contraargumentos',
        description: 'Capacidad de anticipar y responder objeciones',
        weight: 20,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'No considera otras perspectivas' },
          { score: 2, label: 'B\u00e1sico', description: 'Reconocimiento superficial' },
          { score: 3, label: 'Competente', description: 'Considera algunas objeciones' },
          { score: 4, label: 'Avanzado', description: 'Buen manejo de objeciones' },
          { score: 5, label: 'Excelente', description: 'Anticipaci\u00f3n magistral' },
        ],
      },
      {
        id: 'respeto',
        name: 'Respeto y \u00e9tica',
        description: 'Tono respetuoso y \u00e9tico en el debate',
        weight: 15,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Irrespetuoso' },
          { score: 2, label: 'B\u00e1sico', description: 'Poco respetuoso' },
          { score: 3, label: 'Competente', description: 'Generalmente respetuoso' },
          { score: 4, label: 'Avanzado', description: 'Respetuoso' },
          { score: 5, label: 'Excelente', description: 'Ejemplar' },
        ],
      },
    ],
  },
  comic_digital: {
    id: 'rubric-comic',
    name: 'Evaluaci\u00f3n de C\u00f3mic Digital',
    description: 'R\u00fabrica para evaluar creaciones de c\u00f3mic digital',
    mechanicType: 'comic_digital',
    maxScore: 100,
    criteria: [
      {
        id: 'narrativa',
        name: 'Narrativa visual',
        description: 'Secuencia l\u00f3gica y fluidez de la historia',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin secuencia clara' },
          { score: 2, label: 'B\u00e1sico', description: 'Secuencia confusa' },
          { score: 3, label: 'Competente', description: 'Secuencia aceptable' },
          { score: 4, label: 'Avanzado', description: 'Buena secuencia' },
          { score: 5, label: 'Excelente', description: 'Narrativa excepcional' },
        ],
      },
      {
        id: 'creatividad',
        name: 'Creatividad visual',
        description: 'Originalidad en dise\u00f1o y presentaci\u00f3n',
        weight: 25,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin esfuerzo creativo' },
          { score: 2, label: 'B\u00e1sico', description: 'Poca creatividad' },
          { score: 3, label: 'Competente', description: 'Algo de creatividad' },
          { score: 4, label: 'Avanzado', description: 'Creativo' },
          { score: 5, label: 'Excelente', description: 'Muy creativo' },
        ],
      },
      {
        id: 'comprension',
        name: 'Comprensi\u00f3n del tema',
        description: 'Demuestra entendimiento del contenido',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'No demuestra comprensi\u00f3n' },
          { score: 2, label: 'B\u00e1sico', description: 'Comprensi\u00f3n limitada' },
          { score: 3, label: 'Competente', description: 'Comprensi\u00f3n adecuada' },
          { score: 4, label: 'Avanzado', description: 'Buena comprensi\u00f3n' },
          { score: 5, label: 'Excelente', description: 'Comprensi\u00f3n profunda' },
        ],
      },
      {
        id: 'presentacion',
        name: 'Presentaci\u00f3n t\u00e9cnica',
        description: 'Calidad t\u00e9cnica del c\u00f3mic',
        weight: 15,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Ilegible/incompleto' },
          { score: 2, label: 'B\u00e1sico', description: 'Dif\u00edcil de leer' },
          { score: 3, label: 'Competente', description: 'Legible' },
          { score: 4, label: 'Avanzado', description: 'Bien presentado' },
          { score: 5, label: 'Excelente', description: 'Presentaci\u00f3n profesional' },
        ],
      },
    ],
  },
  // ============================================================================
  // MODULE 4 RUBRICS (Digital Reading)
  // ============================================================================
  verificador_fake_news: {
    id: 'rubric-verificador-fake-news',
    name: 'Evaluación de Verificador de Fake News',
    description: 'Rúbrica para evaluar habilidades de verificación de información',
    mechanicType: 'verificador_fake_news',
    maxScore: 100,
    criteria: [
      {
        id: 'precision',
        name: 'Precisión de veredictos',
        description: '¿Los veredictos (verdadero/falso/parcial) son correctos?',
        weight: 40,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Veredictos incorrectos o sin fundamento' },
          { score: 2, label: 'Básico', description: 'Algunos veredictos correctos pero inconsistentes' },
          { score: 3, label: 'Competente', description: 'Mayoría de veredictos correctos' },
          { score: 4, label: 'Avanzado', description: 'Veredictos correctos con buen razonamiento' },
          { score: 5, label: 'Excelente', description: 'Veredictos precisos con análisis riguroso' },
        ],
      },
      {
        id: 'evidencia',
        name: 'Calidad de evidencia',
        description: '¿La evidencia presentada respalda adecuadamente los veredictos?',
        weight: 35,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin evidencia o irrelevante' },
          { score: 2, label: 'Básico', description: 'Evidencia débil o insuficiente' },
          { score: 3, label: 'Competente', description: 'Evidencia aceptable' },
          { score: 4, label: 'Avanzado', description: 'Buena evidencia con citas' },
          { score: 5, label: 'Excelente', description: 'Evidencia excepcional y verificable' },
        ],
      },
      {
        id: 'fuentes',
        name: 'Fuentes citadas',
        description: '¿Se citan fuentes confiables y verificables?',
        weight: 25,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin fuentes citadas' },
          { score: 2, label: 'Básico', description: 'Fuentes poco confiables' },
          { score: 3, label: 'Competente', description: 'Algunas fuentes verificables' },
          { score: 4, label: 'Avanzado', description: 'Fuentes confiables y diversas' },
          { score: 5, label: 'Excelente', description: 'Fuentes académicas/oficiales verificadas' },
        ],
      },
    ],
  },
  infografia_interactiva: {
    id: 'rubric-infografia-interactiva',
    name: 'Evaluación de Infografía Interactiva',
    description: 'Rúbrica para evaluar comprensión de infografías y datos visuales',
    mechanicType: 'infografia_interactiva',
    maxScore: 100,
    criteria: [
      {
        id: 'comprension_datos',
        name: 'Comprensión de datos',
        description: '¿Interpreta correctamente los datos presentados?',
        weight: 35,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'No interpreta los datos' },
          { score: 2, label: 'Básico', description: 'Interpretación superficial' },
          { score: 3, label: 'Competente', description: 'Interpretación adecuada' },
          { score: 4, label: 'Avanzado', description: 'Buena interpretación con conexiones' },
          { score: 5, label: 'Excelente', description: 'Análisis profundo de los datos' },
        ],
      },
      {
        id: 'exploracion',
        name: 'Secciones exploradas',
        description: '¿Exploró todas las secciones relevantes de la infografía?',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'No exploró la infografía' },
          { score: 2, label: 'Básico', description: 'Exploración mínima' },
          { score: 3, label: 'Competente', description: 'Exploración parcial' },
          { score: 4, label: 'Avanzado', description: 'Buena exploración' },
          { score: 5, label: 'Excelente', description: 'Exploración completa y sistemática' },
        ],
      },
      {
        id: 'sintesis',
        name: 'Síntesis de información',
        description: '¿Sintetiza la información de manera coherente?',
        weight: 35,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin síntesis' },
          { score: 2, label: 'Básico', description: 'Síntesis incompleta' },
          { score: 3, label: 'Competente', description: 'Síntesis aceptable' },
          { score: 4, label: 'Avanzado', description: 'Buena síntesis con conclusiones' },
          { score: 5, label: 'Excelente', description: 'Síntesis excepcional e integradora' },
        ],
      },
    ],
  },
  navegacion_hipertextual: {
    id: 'rubric-navegacion-hipertextual',
    name: 'Evaluación de Navegación Hipertextual',
    description: 'Rúbrica para evaluar habilidades de navegación y síntesis de información',
    mechanicType: 'navegacion_hipertextual',
    maxScore: 100,
    criteria: [
      {
        id: 'eficiencia',
        name: 'Eficiencia de navegación',
        description: '¿La ruta de navegación fue eficiente para encontrar la información?',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Navegación caótica o incompleta' },
          { score: 2, label: 'Básico', description: 'Navegación ineficiente' },
          { score: 3, label: 'Competente', description: 'Navegación aceptable' },
          { score: 4, label: 'Avanzado', description: 'Navegación eficiente' },
          { score: 5, label: 'Excelente', description: 'Navegación óptima y estratégica' },
        ],
      },
      {
        id: 'informacion',
        name: 'Información sintetizada',
        description: '¿Sintetizó correctamente la información encontrada?',
        weight: 40,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin información relevante' },
          { score: 2, label: 'Básico', description: 'Información parcial' },
          { score: 3, label: 'Competente', description: 'Información adecuada' },
          { score: 4, label: 'Avanzado', description: 'Buena síntesis de información' },
          { score: 5, label: 'Excelente', description: 'Síntesis completa y bien organizada' },
        ],
      },
      {
        id: 'ruta',
        name: 'Ruta lógica',
        description: '¿La ruta seguida muestra pensamiento lógico?',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin lógica aparente' },
          { score: 2, label: 'Básico', description: 'Poca lógica' },
          { score: 3, label: 'Competente', description: 'Lógica aceptable' },
          { score: 4, label: 'Avanzado', description: 'Buena lógica de navegación' },
          { score: 5, label: 'Excelente', description: 'Estrategia de navegación ejemplar' },
        ],
      },
    ],
  },
  analisis_memes: {
    id: 'rubric-analisis-memes',
    name: 'Evaluación de Análisis de Memes',
    description: 'Rúbrica para evaluar análisis de memes educativos sobre Marie Curie',
    mechanicType: 'analisis_memes',
    maxScore: 100,
    criteria: [
      {
        id: 'interpretacion',
        name: 'Interpretación de elementos',
        description: '¿Interpreta correctamente los elementos visuales y textuales del meme?',
        weight: 35,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'No identifica elementos clave' },
          { score: 2, label: 'Básico', description: 'Identificación superficial' },
          { score: 3, label: 'Competente', description: 'Identificación adecuada' },
          { score: 4, label: 'Avanzado', description: 'Buena interpretación con contexto' },
          { score: 5, label: 'Excelente', description: 'Análisis semiótico profundo' },
        ],
      },
      {
        id: 'cultural',
        name: 'Análisis cultural',
        description: '¿Comprende el contexto cultural y la intención del meme?',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin comprensión cultural' },
          { score: 2, label: 'Básico', description: 'Comprensión limitada' },
          { score: 3, label: 'Competente', description: 'Comprensión aceptable' },
          { score: 4, label: 'Avanzado', description: 'Buena comprensión cultural' },
          { score: 5, label: 'Excelente', description: 'Análisis cultural excepcional' },
        ],
      },
      {
        id: 'precision_historica',
        name: 'Precisión histórica',
        description: '¿El análisis es preciso respecto a los hechos de Marie Curie?',
        weight: 35,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Errores históricos graves' },
          { score: 2, label: 'Básico', description: 'Algunos errores históricos' },
          { score: 3, label: 'Competente', description: 'Mayormente preciso' },
          { score: 4, label: 'Avanzado', description: 'Históricamente preciso' },
          { score: 5, label: 'Excelente', description: 'Precisión histórica impecable' },
        ],
      },
    ],
  },
  // ============================================================================
  // MODULE 5 RUBRICS (Creative Production)
  // ============================================================================
  diario_multimedia: {
    id: 'rubric-diario-multimedia',
    name: 'Evaluación de Diario Multimedia',
    description: 'Rúbrica para evaluar diarios creativos sobre Marie Curie',
    mechanicType: 'diario_multimedia',
    maxScore: 100,
    criteria: [
      {
        id: 'precision_historica',
        name: 'Precisión histórica',
        description: '¿Los eventos y detalles son históricamente precisos?',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Muchos errores históricos' },
          { score: 2, label: 'Básico', description: 'Varios errores' },
          { score: 3, label: 'Competente', description: 'Mayormente preciso' },
          { score: 4, label: 'Avanzado', description: 'Preciso con buenos detalles' },
          { score: 5, label: 'Excelente', description: 'Impecable precisión histórica' },
        ],
      },
      {
        id: 'profundidad_emocional',
        name: 'Profundidad emocional',
        description: '¿Transmite emociones creíbles de Marie Curie?',
        weight: 25,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin conexión emocional' },
          { score: 2, label: 'Básico', description: 'Emociones superficiales' },
          { score: 3, label: 'Competente', description: 'Algunas emociones' },
          { score: 4, label: 'Avanzado', description: 'Buena profundidad emocional' },
          { score: 5, label: 'Excelente', description: 'Conexión emocional excepcional' },
        ],
      },
      {
        id: 'creatividad',
        name: 'Creatividad',
        description: '¿Muestra originalidad y creatividad en la narrativa?',
        weight: 25,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin creatividad' },
          { score: 2, label: 'Básico', description: 'Poca originalidad' },
          { score: 3, label: 'Competente', description: 'Algo creativo' },
          { score: 4, label: 'Avanzado', description: 'Creativo' },
          { score: 5, label: 'Excelente', description: 'Altamente creativo e innovador' },
        ],
      },
      {
        id: 'voz_autentica',
        name: 'Voz auténtica',
        description: '¿La voz narrativa es creíble como Marie Curie?',
        weight: 20,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Voz inconsistente' },
          { score: 2, label: 'Básico', description: 'Voz poco creíble' },
          { score: 3, label: 'Competente', description: 'Voz aceptable' },
          { score: 4, label: 'Avanzado', description: 'Voz auténtica' },
          { score: 5, label: 'Excelente', description: 'Voz magistralmente auténtica' },
        ],
      },
    ],
  },
  video_carta: {
    id: 'rubric-video-carta',
    name: 'Evaluación de Video-Carta',
    description: 'Rúbrica para evaluar video-cartas dirigidas a Marie Curie',
    mechanicType: 'video_carta',
    maxScore: 100,
    criteria: [
      {
        id: 'autenticidad',
        name: 'Autenticidad de voz',
        description: '¿El mensaje es auténtico y personal?',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Mensaje impersonal o copiado' },
          { score: 2, label: 'Básico', description: 'Poca autenticidad' },
          { score: 3, label: 'Competente', description: 'Algo personal' },
          { score: 4, label: 'Avanzado', description: 'Mensaje auténtico' },
          { score: 5, label: 'Excelente', description: 'Profundamente personal y auténtico' },
        ],
      },
      {
        id: 'mensaje',
        name: 'Mensaje',
        description: '¿El mensaje demuestra comprensión del legado de Marie Curie?',
        weight: 30,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin conexión con Marie Curie' },
          { score: 2, label: 'Básico', description: 'Conexión superficial' },
          { score: 3, label: 'Competente', description: 'Conexión adecuada' },
          { score: 4, label: 'Avanzado', description: 'Buena comprensión del legado' },
          { score: 5, label: 'Excelente', description: 'Profunda reflexión sobre el legado' },
        ],
      },
      {
        id: 'estructura',
        name: 'Estructura',
        description: '¿El video/script tiene estructura clara (inicio, desarrollo, cierre)?',
        weight: 25,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin estructura' },
          { score: 2, label: 'Básico', description: 'Estructura confusa' },
          { score: 3, label: 'Competente', description: 'Estructura aceptable' },
          { score: 4, label: 'Avanzado', description: 'Buena estructura' },
          { score: 5, label: 'Excelente', description: 'Estructura excepcional' },
        ],
      },
      {
        id: 'duracion',
        name: 'Duración/Extensión',
        description: '¿El contenido tiene la extensión adecuada (1-3 min video, 100+ palabras script)?',
        weight: 15,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Muy corto (<30 seg o <50 palabras)' },
          { score: 2, label: 'Básico', description: 'Corto (30-60 seg o 50-80 palabras)' },
          { score: 3, label: 'Competente', description: 'Adecuado (1-2 min o 80-100 palabras)' },
          { score: 4, label: 'Avanzado', description: 'Buena extensión (2-3 min o 100-150 palabras)' },
          { score: 5, label: 'Excelente', description: 'Extensión óptima con contenido rico' },
        ],
      },
    ],
  },
  // Generic rubric for other manual mechanics
  generic_creative: {
    id: 'rubric-generic',
    name: 'Evaluaci\u00f3n de Trabajo Creativo',
    description: 'R\u00fabrica general para trabajos creativos',
    mechanicType: 'generic',
    maxScore: 100,
    criteria: [
      {
        id: 'contenido',
        name: 'Contenido',
        description: 'Calidad y relevancia del contenido',
        weight: 35,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Contenido inadecuado' },
          { score: 2, label: 'B\u00e1sico', description: 'Contenido m\u00ednimo' },
          { score: 3, label: 'Competente', description: 'Contenido adecuado' },
          { score: 4, label: 'Avanzado', description: 'Buen contenido' },
          { score: 5, label: 'Excelente', description: 'Contenido excepcional' },
        ],
      },
      {
        id: 'creatividad',
        name: 'Creatividad',
        description: 'Originalidad y esfuerzo creativo',
        weight: 25,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Sin creatividad' },
          { score: 2, label: 'B\u00e1sico', description: 'Poca creatividad' },
          { score: 3, label: 'Competente', description: 'Algo de creatividad' },
          { score: 4, label: 'Avanzado', description: 'Creativo' },
          { score: 5, label: 'Excelente', description: 'Muy creativo' },
        ],
      },
      {
        id: 'esfuerzo',
        name: 'Esfuerzo',
        description: 'Dedicaci\u00f3n y completitud del trabajo',
        weight: 25,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Trabajo incompleto' },
          { score: 2, label: 'B\u00e1sico', description: 'Esfuerzo m\u00ednimo' },
          { score: 3, label: 'Competente', description: 'Esfuerzo aceptable' },
          { score: 4, label: 'Avanzado', description: 'Buen esfuerzo' },
          { score: 5, label: 'Excelente', description: 'Esfuerzo sobresaliente' },
        ],
      },
      {
        id: 'presentacion',
        name: 'Presentaci\u00f3n',
        description: 'Claridad y organizaci\u00f3n',
        weight: 15,
        levels: [
          { score: 1, label: 'Insuficiente', description: 'Desorganizado' },
          { score: 2, label: 'B\u00e1sico', description: 'Poco organizado' },
          { score: 3, label: 'Competente', description: 'Organizado' },
          { score: 4, label: 'Avanzado', description: 'Bien organizado' },
          { score: 5, label: 'Excelente', description: 'Excelente presentaci\u00f3n' },
        ],
      },
    ],
  },
};

/**
 * Get rubric for a specific mechanic type
 */
export const getRubricForMechanic = (mechanicType: string): RubricConfig => {
  return DEFAULT_RUBRICS[mechanicType] || DEFAULT_RUBRICS.generic_creative;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CriterionCardProps {
  criterion: RubricCriterion;
  selectedLevel: number | undefined;
  feedback: string;
  onLevelSelect: (level: number) => void;
  onFeedbackChange: (feedback: string) => void;
  readOnly?: boolean;
}

const CriterionCard: React.FC<CriterionCardProps> = ({
  criterion,
  selectedLevel,
  feedback,
  onLevelSelect,
  onFeedbackChange,
  readOnly = false,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-800">{criterion.name}</h4>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {criterion.weight}%
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{criterion.description}</p>
        </div>
        {selectedLevel !== undefined && (
          <div className="ml-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= selectedLevel
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Level Selection */}
      <div className="mb-3 grid grid-cols-5 gap-2">
        {criterion.levels.map((level) => (
          <button
            key={level.score}
            onClick={() => !readOnly && onLevelSelect(level.score)}
            disabled={readOnly}
            className={`group relative rounded-lg border-2 p-2 transition-all ${
              selectedLevel === level.score
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className="text-center">
              <span
                className={`block text-lg font-bold ${
                  selectedLevel === level.score ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {level.score}
              </span>
              <span className="block text-xs text-gray-600">{level.label}</span>
            </div>

            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-gray-800 p-2 text-xs text-white group-hover:block">
              {level.description}
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
            </div>
          </button>
        ))}
      </div>

      {/* Feedback Toggle */}
      {!readOnly && (
        <div>
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <MessageSquare className="h-4 w-4" />
            {showFeedback ? 'Ocultar comentario' : 'Agregar comentario'}
          </button>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2"
            >
              <textarea
                value={feedback}
                onChange={(e) => onFeedbackChange(e.target.value)}
                placeholder="Comentario sobre este criterio..."
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={2}
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Show feedback in readOnly mode */}
      {readOnly && feedback && (
        <div className="mt-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-700">
          <span className="font-medium">Comentario:</span> {feedback}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RubricEvaluator: React.FC<RubricEvaluatorProps> = ({
  rubric,
  initialScores = [],
  onScoreChange,
  onSubmit,
  readOnly = false,
}) => {
  // Initialize scores from props or empty
  const [scores, setScores] = useState<Record<string, RubricScore>>(() => {
    const initial: Record<string, RubricScore> = {};
    initialScores.forEach((score) => {
      initial[score.criterionId] = score;
    });
    return initial;
  });
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Calculate total score
  const { totalScore, percentage, isComplete } = useMemo(() => {
    let weightedSum = 0;
    let totalWeight = 0;
    let complete = true;

    rubric.criteria.forEach((criterion) => {
      const score = scores[criterion.id];
      if (score?.selectedLevel !== undefined) {
        // Normalize to percentage: (score/5) * weight
        weightedSum += (score.selectedLevel / 5) * criterion.weight;
        totalWeight += criterion.weight;
      } else {
        complete = false;
      }
    });

    const pct = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
    const total = Math.round((pct / 100) * rubric.maxScore);

    return {
      totalScore: total,
      percentage: Math.round(pct),
      isComplete: complete,
    };
  }, [scores, rubric]);

  // Notify parent of changes
  const notifyChange = useCallback(
    (newScores: Record<string, RubricScore>) => {
      if (onScoreChange) {
        const scoresArray = Object.values(newScores);
        let weightedSum = 0;

        rubric.criteria.forEach((criterion) => {
          const score = newScores[criterion.id];
          if (score?.selectedLevel !== undefined) {
            weightedSum += (score.selectedLevel / 5) * criterion.weight;
          }
        });

        const pct = Math.round(weightedSum);
        const total = Math.round((weightedSum / 100) * rubric.maxScore);
        onScoreChange(scoresArray, total, pct);
      }
    },
    [onScoreChange, rubric],
  );

  // Handle level selection
  const handleLevelSelect = useCallback(
    (criterionId: string, level: number) => {
      const newScores = {
        ...scores,
        [criterionId]: {
          ...scores[criterionId],
          criterionId,
          selectedLevel: level,
        },
      };
      setScores(newScores);
      notifyChange(newScores);
    },
    [scores, notifyChange],
  );

  // Handle criterion feedback
  const handleFeedbackChange = useCallback(
    (criterionId: string, feedback: string) => {
      const newScores = {
        ...scores,
        [criterionId]: {
          ...scores[criterionId],
          criterionId,
          feedback,
        },
      };
      setScores(newScores);
      notifyChange(newScores);
    },
    [scores, notifyChange],
  );

  // Reset all scores
  const handleReset = () => {
    setScores({});
    setGeneralFeedback('');
    setSubmitStatus('idle');
    if (onScoreChange) {
      onScoreChange([], 0, 0);
    }
  };

  // Submit evaluation
  const handleSubmit = async () => {
    if (!onSubmit || !isComplete) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await onSubmit(Object.values(scores), totalScore, generalFeedback);
      setSubmitStatus('success');
    } catch (error) {
      console.error('[RubricEvaluator] Submit error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get grade color
  const getGradeColor = (pct: number): string => {
    if (pct >= 90) return 'text-green-600 bg-green-100';
    if (pct >= 80) return 'text-blue-600 bg-blue-100';
    if (pct >= 70) return 'text-yellow-600 bg-yellow-100';
    if (pct >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{rubric.name}</h3>
            <p className="mt-1 text-sm text-gray-600">{rubric.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {rubric.criteria.length} criterios
            </span>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 p-4">
        <div>
          <p className="text-sm text-gray-600">Puntaje calculado</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800">{totalScore}</span>
            <span className="text-lg text-gray-500">/ {rubric.maxScore}</span>
          </div>
        </div>
        <div className={`rounded-xl px-6 py-3 ${getGradeColor(percentage)}`}>
          <p className="text-3xl font-bold">{percentage}%</p>
        </div>
      </div>

      {/* Criteria */}
      <div className="space-y-4">
        {rubric.criteria.map((criterion) => (
          <CriterionCard
            key={criterion.id}
            criterion={criterion}
            selectedLevel={scores[criterion.id]?.selectedLevel}
            feedback={scores[criterion.id]?.feedback || ''}
            onLevelSelect={(level) => handleLevelSelect(criterion.id, level)}
            onFeedbackChange={(feedback) => handleFeedbackChange(criterion.id, feedback)}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* General Feedback */}
      {!readOnly && (
        <div>
          <label className="mb-2 block font-semibold text-gray-700">
            Retroalimentaci\u00f3n general
          </label>
          <textarea
            value={generalFeedback}
            onChange={(e) => setGeneralFeedback(e.target.value)}
            placeholder="Escribe comentarios generales para el estudiante..."
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={4}
          />
        </div>
      )}

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4"
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="font-medium text-green-800">Evaluaci\u00f3n guardada exitosamente</p>
        </motion.div>
      )}

      {submitStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="font-medium text-red-800">Error al guardar la evaluaci\u00f3n</p>
        </motion.div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </button>

          <div className="flex items-center gap-3">
            {!isComplete && (
              <p className="text-sm text-orange-600">
                Faltan {rubric.criteria.length - Object.keys(scores).length} criterios
              </p>
            )}
            {onSubmit && (
              <button
                onClick={handleSubmit}
                disabled={!isComplete || isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-2 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar evaluaci\u00f3n
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RubricEvaluator;
