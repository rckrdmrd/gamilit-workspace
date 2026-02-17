import { Plus, Trash2, GitBranch } from 'lucide-react';

interface ConceptNode {
  id: string;
  text: string;
  connections: string[];
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function MapaConceptualConfig({ config, onChange }: TypeConfigProps) {
  const centralConcept = (config.centralConcept as string) || '';
  const nodes = (config.nodes as ConceptNode[]) || [];

  const addNode = () => {
    const newNode: ConceptNode = {
      id: `node-${Date.now()}`,
      text: '',
      connections: [],
    };
    onChange({ ...config, nodes: [...nodes, newNode] });
  };

  const updateNode = (idx: number, field: string, value: unknown) => {
    const updated = nodes.map((n, i) => (i === idx ? { ...n, [field]: value } : n));
    onChange({ ...config, nodes: updated });
  };

  const removeNode = (idx: number) => {
    const removedId = nodes[idx].id;
    const updated = nodes
      .filter((_, i) => i !== idx)
      .map((n) => ({
        ...n,
        connections: n.connections.filter((c) => c !== removedId),
      }));
    onChange({ ...config, nodes: updated });
  };

  const toggleConnection = (nodeIdx: number, targetId: string) => {
    const node = nodes[nodeIdx];
    const hasConnection = node.connections.includes(targetId);
    const newConnections = hasConnection
      ? node.connections.filter((c) => c !== targetId)
      : [...node.connections, targetId];
    updateNode(nodeIdx, 'connections', newConnections);
  };

  return (
    <div className="space-y-5">
      {/* Central Concept */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-400">
          Concepto Central
        </label>
        <input
          type="text"
          className="input-detective w-full"
          placeholder="Ej: Civilizacion Maya"
          value={centralConcept}
          onChange={(e) => onChange({ ...config, centralConcept: e.target.value })}
        />
      </div>

      {/* Nodes */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Nodos ({nodes.length})
          </label>
          <button
            type="button"
            onClick={addNode}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Nodo
          </button>
        </div>

        <div className="space-y-3">
          {nodes.map((node, idx) => (
            <div key={node.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-detective-orange">
                  Nodo #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeNode(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-500">Texto</label>
                <input
                  type="text"
                  className="input-detective w-full text-sm"
                  placeholder="Concepto o idea..."
                  value={node.text}
                  onChange={(e) => updateNode(idx, 'text', e.target.value)}
                />
              </div>
              {/* Connections */}
              {nodes.length > 1 && (
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                    <GitBranch className="h-3 w-3" /> Conexiones
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {nodes
                      .filter((_, i) => i !== idx)
                      .map((target) => {
                        const isConnected = node.connections.includes(target.id);
                        return (
                          <button
                            key={target.id}
                            type="button"
                            onClick={() => toggleConnection(idx, target.id)}
                            className={
                              isConnected
                                ? 'rounded-full bg-detective-orange/20 px-2 py-0.5 text-xs text-detective-orange'
                                : 'rounded-full bg-gray-700/50 px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-600/50'
                            }
                          >
                            {target.text || `Nodo`}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {nodes.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega nodos para construir el mapa conceptual.
          </p>
        )}
      </div>
    </div>
  );
}

export default MapaConceptualConfig;
