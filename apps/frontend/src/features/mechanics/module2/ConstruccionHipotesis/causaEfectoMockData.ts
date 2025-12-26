/**
 * Causa-Efecto Mock Data - Marie Curie Cause and Effect Relationships
 * Drag and drop exercise for understanding causal relationships in science
 */

import { DifficultyLevel } from '@shared/types/educational.types';
import type { CausaEfectoData } from './causaEfectoTypes';

export const causaEfectoMockExercise: CausaEfectoData = {
  id: 'causa-efecto-001',
  type: 'matching',
  title: 'Construcción de Hipótesis: Causa y Efecto',
  description:
    'Relaciona las causas con sus consecuencias en la vida científica de Marie Curie.',
  instructions:
    'Arrastra cada consecuencia (derecha) hacia la causa correspondiente (izquierda). Analiza cuidadosamente las relaciones causales entre los eventos científicos y sus resultados.',
  difficulty: DifficultyLevel.INTERMEDIATE,
  estimatedTime: 360, // 6 minutes
  maxAttempts: 3,
  hints: [
    {
      id: 'hint-001',
      text: 'Considera el orden cronológico de los eventos y cómo cada descubrimiento llevó a nuevas oportunidades o desafíos.',
      cost: 10,
    },
    {
      id: 'hint-002',
      text: 'Piensa en las consecuencias tanto científicas como personales de cada acción de Marie Curie.',
      cost: 15,
    },
    {
      id: 'hint-003',
      text: 'Algunas causas pueden tener múltiples efectos. Busca las relaciones lógicas más directas entre causa y consecuencia.',
      cost: 20,
    },
  ],
  config: {
    allowMultiple: true, // Una causa puede tener múltiples consecuencias
    showFeedback: true,
    dragAndDrop: true,
  },
  content: {
    causes: [
      {
        id: 'causa-1',
        text: 'Marie Curie trabajó con materiales radiactivos sin protección durante años',
      },
      {
        id: 'causa-2',
        text: 'Marie descubrió dos nuevos elementos químicos: el polonio y el radio',
      },
      {
        id: 'causa-3',
        text: 'El esposo de Marie, Pierre Curie, murió en un accidente en 1906',
      },
      {
        id: 'causa-4',
        text: 'Marie fue la primera mujer en ganar un Premio Nobel',
      },
      {
        id: 'causa-5',
        text: 'Durante la Primera Guerra Mundial, Marie desarrolló unidades móviles de rayos X',
      },
      {
        id: 'causa-6',
        text: 'Marie compartió sus investigaciones sobre radiactividad libremente con la comunidad científica',
      },
    ],
    consequences: [
      {
        id: 'consecuencia-1',
        text: 'Desarrolló anemia aplásica y murió de leucemia en 1934',
      },
      {
        id: 'consecuencia-2',
        text: 'Recibió el Premio Nobel de Química en 1911, siendo la primera persona en ganar dos premios Nobel',
      },
      {
        id: 'consecuencia-3',
        text: 'Abrió camino para que más mujeres ingresaran a la ciencia',
      },
      {
        id: 'consecuencia-4',
        text: 'Marie asumió la cátedra de física de Pierre, convirtiéndose en la primera profesora mujer de la Sorbona',
      },
      {
        id: 'consecuencia-5',
        text: 'Salvó la vida de miles de soldados heridos mediante diagnósticos médicos precisos',
      },
      {
        id: 'consecuencia-6',
        text: 'Aceleró el progreso científico global al no patentar sus descubrimientos',
      },
      {
        id: 'consecuencia-7',
        text: 'Sus cuadernos de investigación permanecen radiactivos hasta hoy, requiriendo protección especial para consultarlos',
      },
      {
        id: 'consecuencia-8',
        text: 'El polonio recibió su nombre en honor a Polonia, su país natal',
      },
      {
        id: 'consecuencia-9',
        text: 'Tuvo que enfrentar sola la responsabilidad de criar a sus dos hijas mientras continuaba su investigación',
      },
      {
        id: 'consecuencia-10',
        text: 'Las aplicaciones médicas del radio revolucionaron el tratamiento del cáncer',
      },
    ],
  },
};

/**
 * Expected correct matches for testing/validation:
 *
 * causa-1 → consecuencia-1 (trabajó sin protección → murió de leucemia)
 * causa-1 → consecuencia-7 (trabajó sin protección → cuadernos radiactivos)
 *
 * causa-2 → consecuencia-2 (descubrió elementos → Nobel de Química)
 * causa-2 → consecuencia-8 (descubrió elementos → polonio honra a Polonia)
 * causa-2 → consecuencia-10 (descubrió elementos → aplicaciones médicas)
 *
 * causa-3 → consecuencia-4 (Pierre murió → Marie asumió su cátedra)
 * causa-3 → consecuencia-9 (Pierre murió → criar hijas sola)
 *
 * causa-4 → consecuencia-3 (primera Nobel → abrió camino para mujeres)
 *
 * causa-5 → consecuencia-5 (unidades móviles rayos X → salvó soldados)
 *
 * causa-6 → consecuencia-6 (compartió investigación → aceleró progreso)
 */

export const causaEfectoMockData = [causaEfectoMockExercise];
