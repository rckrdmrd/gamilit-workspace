import { ConceptNode } from './mapaConceptualTypes';

export const ConnectionLine = ({ from, to }: { from: ConceptNode; to: ConceptNode }) => (
  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)" />
);
