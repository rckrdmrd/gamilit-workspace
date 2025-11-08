import type { TribunalExercise } from './tribunalOpinionesTypes';

export const mockTribunal: TribunalExercise = {
  id: 'tribunal-1',
  topic: 'Sacrificio Científico',
  question: '¿Fue correcto que Marie Curie arriesgara su salud por la ciencia?',
  opinions: [
    { id: 'op1', author: 'Científico Moderno', stance: 'en_contra', text: 'La seguridad del investigador debe ser prioritaria', arguments: ['Protocolos modernos', 'Longevidad científica'], evidence: ['Safety guidelines'] },
    { id: 'op2', author: 'Historiador', stance: 'a_favor', text: 'En su época no conocían los riesgos', arguments: ['Contexto histórico', 'Avance científico'], evidence: ['Historical records'] },
    { id: 'op3', author: 'Bioético', stance: 'neutral', text: 'Debemos considerar el contexto de la época', arguments: ['Relativismo histórico'], evidence: ['Ethics journals'] },
  ],
};
