import React, { useState } from 'react';
import { ExerciseContainer } from '@shared/components/mechanics/ExerciseContainer';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ConceptNode } from './ConceptNode';
import { ConnectionLine } from './ConnectionLine';
import { MapaConceptualData } from './mapaConceptualTypes';
import { Check } from 'lucide-react';

export const MapaConceptualExercise: React.FC<{ exercise: MapaConceptualData; onComplete?: () => void }> = ({ exercise }) => {
  const [connections, setConnections] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Ensure nodes array exists with fallback
  const nodes = exercise?.nodes || [];
  const correctConnections = exercise?.correctConnections || [];

  const handleNodeClick = (nodeId: string) => {
    if (!selectedNode) {
      setSelectedNode(nodeId);
    } else if (selectedNode !== nodeId) {
      const connId = `${selectedNode}-${nodeId}`;
      setConnections(prev => [...prev, connId]);
      setSelectedNode(null);
    }
  };

  // If no nodes, show message
  if (nodes.length === 0) {
    return (
      <ExerciseContainer exercise={exercise}>
        <DetectiveCard variant="default" padding="lg">
          <p className="text-center text-detective-text-secondary">
            Este ejercicio aún no tiene contenido disponible. Por favor, contacta a tu profesor.
          </p>
        </DetectiveCard>
      </ExerciseContainer>
    );
  }

  return (
    <ExerciseContainer exercise={exercise}>
      <DetectiveCard variant="default" padding="lg">
        <div className="relative w-full h-[600px] bg-gray-50 rounded-lg">
          <svg className="absolute inset-0 w-full h-full">
            {connections.map((conn, i) => {
              const [fromId, toId] = conn.split('-');
              const from = nodes.find(n => n.id === fromId);
              const to = nodes.find(n => n.id === toId);
              return from && to ? <ConnectionLine key={i} from={from} to={to} /> : null;
            })}
          </svg>
          {nodes.map(node => (
            <ConceptNode key={node.id} node={node} isSelected={selectedNode === node.id} onClick={() => handleNodeClick(node.id)} />
          ))}
        </div>
        <DetectiveButton variant="gold" icon={<Check />} className="mt-4">Verificar</DetectiveButton>
      </DetectiveCard>
    </ExerciseContainer>
  );
};

export default MapaConceptualExercise;
