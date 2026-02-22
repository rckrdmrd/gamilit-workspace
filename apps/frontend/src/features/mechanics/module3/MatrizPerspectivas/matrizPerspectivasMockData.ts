import type { PerspectiveGeneration } from './matrizPerspectivasTypes';

export const matrixExercise = {
  id: 'matrix-1',
  topic: 'Marie Curie y la Igualdad de Género',
  description: 'Explora diferentes perspectivas sobre el impacto de Marie Curie en la igualdad de género en ciencia.',
  perspectiveCount: 3,
};

export const mockPerspectives: PerspectiveGeneration[] = [
  {
    perspective: 'Perspectiva Feminista',
    viewpoint: 'Marie Curie rompió barreras de género en un mundo científico dominado por hombres, demostrando que las mujeres podían alcanzar los más altos logros académicos.',
    arguments: [
      'Fue la primera mujer en ganar un Premio Nobel',
      'Primera persona en ganar dos Nobeles en diferentes disciplinas',
      'Abrió camino para futuras generaciones de científicas',
    ],
    counterarguments: [
      'Su éxito fue excepcional y no representativo de la experiencia de la mayoría de mujeres',
      'Las barreras sistémicas persistieron durante décadas después de sus logros',
    ],
    biases: [
      'Sesgo de supervivencia: se celebra a quien tuvo éxito ignorando a quienes no pudieron',
      'Sesgo de género: sus logros a menudo se minimizan comparados con colegas masculinos',
    ],
    contextualFactors: [
      'Época: finales del siglo XIX, movimientos sufragistas emergentes',
      'Polonia bajo dominio ruso limitaba la educación de mujeres',
      'Francia era más progresista pero aún discriminatoria',
    ],
  },
  {
    perspective: 'Perspectiva Científica',
    viewpoint: 'Los descubrimientos de Marie Curie sobre la radioactividad revolucionaron la física y la química, independientemente de su género.',
    arguments: [
      'Descubrió dos elementos químicos: polonio y radio',
      'Desarrolló la teoría de la radioactividad',
      'Sus investigaciones sentaron las bases de la medicina nuclear',
    ],
    counterarguments: [
      'Su trabajo fue colaborativo con Pierre Curie y Henri Becquerel',
      'La exposición a radiación que sufrió plantea preguntas sobre seguridad en la investigación',
    ],
    biases: [
      'Sesgo de atribución individual: la ciencia es colaborativa',
      'Sesgo de presentismo: juzgar con estándares actuales de seguridad',
    ],
    contextualFactors: [
      'No existían protocolos de seguridad radiológica',
      'La ciencia del siglo XIX valoraba el descubrimiento individual',
      'El acceso a laboratorios era limitado para mujeres',
    ],
  },
  {
    perspective: 'Perspectiva Social',
    viewpoint: 'La vida de Marie Curie refleja las tensiones entre el reconocimiento público y los prejuicios sociales de su época.',
    arguments: [
      'Enfrentó discriminación de la Academia Francesa de Ciencias',
      'La prensa la atacó por su relación con Paul Langevin',
      'Demostró resiliencia ante la adversidad social',
    ],
    counterarguments: [
      'Su estatus de celebridad le otorgó privilegios que otras mujeres no tenían',
      'La narrativa heroica puede simplificar problemas estructurales complejos',
    ],
    biases: [
      'Sesgo de narrativa heroica: simplificar la lucha colectiva en una historia individual',
      'Sesgo cultural: diferentes sociedades valoraban su trabajo de formas distintas',
    ],
    contextualFactors: [
      'La prensa sensacionalista del siglo XX amplificaba escándalos',
      'El nacionalismo polaco y francés disputaba su identidad',
      'Los movimientos sociales de la época influían en la percepción pública',
    ],
  },
];
