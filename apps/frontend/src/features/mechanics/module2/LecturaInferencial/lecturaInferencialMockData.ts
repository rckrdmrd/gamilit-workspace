/**
 * Lectura Inferencial Mock Data - Marie Curie Reading Comprehension
 * Multiple choice exercise for inferential reading comprehension
 */

import { DifficultyLevel } from '@shared/types/educational.types';
import type { LecturaInferencialData } from './lecturaInferencialTypes';

export const lecturaInferencialMockExercise: LecturaInferencialData = {
  id: 'lectura-inferencial-001',
  type: 'multiple-choice',
  title: 'Lectura Inferencial: Los Primeros Años de Marie Curie',
  description:
    'Lee el texto sobre los inicios de Marie Curie y responde las preguntas haciendo inferencias basadas en el contexto.',
  instructions:
    'Lee cuidadosamente el pasaje y selecciona la respuesta más apropiada para cada pregunta. Las respuestas requieren hacer inferencias más allá de lo explícitamente dicho en el texto.',
  difficulty: DifficultyLevel.INTERMEDIATE,
  estimatedTime: 480, // 8 minutes
  maxAttempts: 3,
  hints: [
    {
      id: 'hint-001',
      text: 'Presta atención a las motivaciones implícitas de los personajes y el contexto histórico de la época.',
      cost: 10,
    },
    {
      id: 'hint-002',
      text: 'Considera las barreras sociales que enfrentaban las mujeres en la educación superior durante el siglo XIX.',
      cost: 15,
    },
    {
      id: 'hint-003',
      text: 'Las respuestas correctas no siempre están explícitas en el texto. Analiza las relaciones causa-efecto y el contexto cultural.',
      cost: 20,
    },
  ],
  config: {
    timePerQuestion: 120, // 2 minutes per question
    allowReview: true,
    showExplanations: true,
    shuffleQuestions: false,
    shuffleOptions: true,
  },
  content: {
    passage: `
Varsovia, 1883. Maria Sklodowska tenía apenas 16 años cuando completó sus estudios secundarios con medalla de oro. Sin embargo, su brillante desempeño académico no le garantizaba el acceso a la universidad. En Polonia, bajo el dominio ruso, las mujeres tenían prohibido asistir a la educación superior.

Maria y su hermana mayor, Bronya, soñaban con estudiar en la Universidad de la Sorbona en París, pero la situación económica de la familia lo hacía imposible. Su padre, maestro de física y matemáticas, había perdido sus ahorros en malas inversiones, y mantenía a la familia con un salario modesto.

Las dos hermanas idearon un plan audaz: Maria trabajaría como institutriz durante seis años para financiar los estudios de Bronya en París. Una vez que Bronya se graduara como médica y empezara a ejercer, sería ella quien financiaría los estudios de Maria. Durante esos años, Maria enseñaba durante el día a los hijos de familias acomodadas y estudiaba por las noches, devorando libros de física, química y matemáticas que su padre le enviaba.

En 1891, a los 24 años, Maria finalmente llegó a París con lo mínimo: algunas mudas de ropa, unos cuantos libros y la determinación férrea que la caracterizaría toda su vida. Se inscribió en la Facultad de Ciencias de la Sorbona como "Marie", la versión francesa de su nombre. Vivía en una buhardilla helada del Barrio Latino, con frecuencia sin calefacción ni comida suficiente, dedicando cada momento a sus estudios.

Dos años después, Marie obtuvo su licenciatura en Física, siendo la primera de su promoción. Un año más tarde completó una segunda licenciatura en Matemáticas. Su talento excepcional había superado todos los obstáculos que la sociedad y las circunstancias habían puesto en su camino.
    `.trim(),
    questions: [
      {
        id: 'li-q1',
        question:
          '¿Qué se puede inferir sobre la relación entre Maria y su hermana Bronya?',
        options: [
          'Eran rivales académicas que competían por la atención de su padre',
          'Compartían una profunda confianza mutua y compromiso con el éxito de la otra',
          'Bronya obligó a Maria a trabajar para pagar sus estudios',
          'Maria sentía resentimiento por tener que esperar su turno',
        ],
        correctAnswer: 1,
        explanation:
          'El pacto entre las hermanas demuestra una confianza extraordinaria. Maria aceptó trabajar seis años con la promesa de que Bronya la apoyaría después. Este acuerdo requería una fe mutua profunda y un compromiso compartido con la educación, mostrando una relación basada en solidaridad y sacrificio recíproco.',
        inference_type: 'motivacion',
      },
      {
        id: 'li-q2',
        question:
          '¿Por qué el texto menciona específicamente que Maria llegó a París "con lo mínimo"?',
        options: [
          'Para mostrar que era descuidada con sus pertenencias',
          'Para enfatizar su humildad económica y su enfoque en lo esencial',
          'Para sugerir que no valoraba las posesiones materiales',
          'Para indicar que había perdido su equipaje en el viaje',
        ],
        correctAnswer: 1,
        explanation:
          'La mención de sus escasas pertenencias contrasta con su "determinación férrea", enfatizando que a pesar de la pobreza material, su riqueza intelectual y motivación eran inmensas. Este detalle subraya el sacrificio y la priorización de sus objetivos académicos sobre el confort material.',
        inference_type: 'contexto_situacional',
      },
      {
        id: 'li-q3',
        question:
          '¿Qué sugiere el cambio de "Maria" a "Marie" al inscribirse en la Sorbona?',
        options: [
          'Quería ocultar su identidad polaca por vergüenza',
          'Era un requisito obligatorio de la universidad francesa',
          'Buscaba adaptarse al contexto francés para facilitar su integración',
          'Fue un error administrativo de la universidad',
        ],
        correctAnswer: 2,
        explanation:
          'El cambio a la versión francesa de su nombre sugiere una adaptación práctica al nuevo entorno. Para una mujer extranjera en el París del siglo XIX, ya enfrentaba múltiples barreras; adaptar su nombre era una estrategia pragmática para integrarse mejor y reducir obstáculos adicionales, sin necesariamente renunciar a su identidad.',
        inference_type: 'interpretacion',
      },
      {
        id: 'li-q4',
        question:
          'Basándose en el texto, ¿qué efecto probablemente tuvo la experiencia como institutriz en el desarrollo de Marie?',
        options: [
          'Le hizo perder interés en la ciencia al dedicarse a la enseñanza',
          'Desarrolló habilidades de comunicación y disciplina que fortalecieron su carácter',
          'Fue únicamente una pérdida de tiempo que retrasó su carrera',
          'La convenció de que prefería enseñar a investigar',
        ],
        correctAnswer: 1,
        explanation:
          'Aunque no se menciona explícitamente, el texto indica que durante esos seis años Marie "estudiaba por las noches" mientras trabajaba de día. Esta experiencia de simultanear trabajo, estudio y sacrificio personal probablemente fortaleció su disciplina, perseverancia y capacidad de organización, cualidades esenciales para su futura carrera científica.',
        inference_type: 'causa_efecto',
      },
      {
        id: 'li-q5',
        question:
          '¿Qué se puede concluir sobre las condiciones de vida de Marie en París?',
        options: [
          'Vivía cómodamente gracias al apoyo financiero de Bronya',
          'Eligió vivir en pobreza extrema a pesar de tener otras opciones',
          'Sus condiciones precarias reflejaban su compromiso total con los estudios y recursos limitados',
          'La universidad le proporcionaba alojamiento inadecuado',
        ],
        correctAnswer: 2,
        explanation:
          'La descripción de su "buhardilla helada", frecuentemente "sin calefacción ni comida suficiente" mientras dedicaba "cada momento a sus estudios" revela que Marie vivía en condiciones de extrema austeridad. Esto no era una elección caprichosa, sino el resultado de recursos muy limitados combinados con una dedicación absoluta a sus estudios, sacrificando comodidades básicas por su educación.',
        inference_type: 'conclusion',
      },
      {
        id: 'li-q6',
        question:
          '¿Qué predice el texto sobre el futuro académico de Marie después de obtener sus licenciaturas?',
        options: [
          'Probablemente regresaría a Polonia satisfecha con sus logros',
          'Continuaría superando obstáculos y alcanzando logros mayores en la ciencia',
          'Dejaría la ciencia para dedicarse a enseñar como su padre',
          'Se conformaría con un puesto académico modesto',
        ],
        correctAnswer: 1,
        explanation:
          'La frase final "Su talento excepcional había superado todos los obstáculos" junto con la descripción constante de su "determinación férrea" y capacidad para triunfar en circunstancias adversas, sugiere fuertemente que Marie continuaría enfrentando y superando desafíos. El tono del texto establece un patrón de perseverancia y excelencia que anticipa logros futuros aún mayores.',
        inference_type: 'prediccion',
      },
    ],
  },
};

export const lecturaInferencialMockData = [lecturaInferencialMockExercise];
