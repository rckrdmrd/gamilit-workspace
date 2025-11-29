/**
 * Detective Textual Mock Data - Marie Curie Investigation
 * Multiple choice exercise for textual inference
 */

import type { DetectiveTextualExercise } from './detectiveTextualTypes';

export const mockExercise: DetectiveTextualExercise = {
  id: 'detective-textual-1',
  title: 'Detective Textual: El Misterio de la Radiación',
  description: 'Analiza el texto sobre Marie Curie para encontrar información implícita.',
  passage:
    'Marie Curie trabajaba largas horas en un laboratorio mal ventilado, rodeada de materiales radiactivos. A menudo llevaba tubos de ensayo con radio en los bolsillos de su bata de trabajo. Sus cuadernos de investigación brillaban misteriosamente en la oscuridad de la noche. A pesar de sentirse frecuentemente fatigada y con dolores, Marie continuaba su investigación sin descanso, convencida de que su trabajo beneficiaría a la humanidad.',
  questions: [
    {
      id: 'q1',
      question: '¿Por qué los cuadernos de Marie brillaban en la oscuridad?',
      options: [
        'Usaba tinta especial fluorescente para escribir',
        'Estaban contaminados con material radiactivo',
        'Los escribía con lápiz luminoso importado',
        'Era un efecto óptico de la luz de la luna',
      ],
      correctAnswer: 1,
      explanation:
        'La radiación del radio con el que trabajaba constantemente contaminó sus cuadernos, haciéndolos radioactivos y, por tanto, luminiscentes.',
      inference_type: 'causa_efecto',
    },
    {
      id: 'q2',
      question: '¿Qué podemos inferir sobre las condiciones de seguridad en su laboratorio?',
      options: [
        'Eran excelentes y seguían protocolos estrictos',
        'Eran inadecuadas y peligrosas para la salud',
        'Cumplían con los estándares modernos de seguridad',
        'No trabajaba con materiales peligrosos realmente',
      ],
      correctAnswer: 1,
      explanation:
        'Llevar material radiactivo en los bolsillos y trabajar en un lugar mal ventilado indica una total falta de protocolos de seguridad adecuados.',
      inference_type: 'contexto_situacional',
    },
    {
      id: 'q3',
      question: '¿Qué sugiere el texto sobre la relación entre sus síntomas físicos y su trabajo?',
      options: [
        'Sus síntomas no tenían relación con su investigación',
        'La fatiga y dolores probablemente eran causados por la exposición a radiación',
        'Sufría de enfermedades comunes no relacionadas',
        'Los síntomas eran psicosomáticos por estrés',
      ],
      correctAnswer: 1,
      explanation:
        'La conexión entre trabajar con materiales radiactivos sin protección y experimentar fatiga y dolores sugiere fuertemente que la radiación estaba afectando su salud.',
      inference_type: 'causa_efecto',
    },
    {
      id: 'q4',
      question:
        '¿Qué motivación impulsaba a Marie a continuar trabajando a pesar de sus malestares?',
      options: [
        'El deseo de ganar fama y reconocimiento personal',
        'La convicción de que su trabajo ayudaría a la humanidad',
        'La presión de su esposo Pierre',
        'La necesidad económica de su familia',
      ],
      correctAnswer: 1,
      explanation:
        'El texto menciona explícitamente que Marie continuaba su trabajo convencida de que beneficiaría a la humanidad, mostrando su motivación altruista.',
      inference_type: 'motivacion',
    },
  ],
  difficulty: 'medium',
};
