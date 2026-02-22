import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@shared/utils/cn';

// Temporary stub components until exercise components are implemented
const CategoryBadge = () => <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />;

const DraggableItem = ({
  children,
  onDragStart,
  onDragEnd,
}: {
  children: ReactNode;
  id?: string;
  variant?: string;
  isConnected?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) => (
  <div
    draggable
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    className="cursor-move rounded-lg border-2 border-detective-border bg-white p-3 transition-colors hover:border-blue-400"
  >
    {children}
  </div>
);

const DropZone = ({
  children,
  onDrop,
  isCorrect,
}: {
  children: ReactNode;
  onDrop?: () => void;
  isCorrect?: boolean | null;
  isEmpty?: boolean;
  isActive?: boolean;
}) => (
  <div
    onDrop={onDrop}
    onDragOver={(e) => e.preventDefault()}
    className={cn(
      'min-h-[60px] rounded-lg border-2 border-dashed p-4 transition-colors',
      isCorrect === true && 'border-detective-success bg-detective-success/10',
      isCorrect === false && 'border-detective-danger bg-detective-danger/10',
      isCorrect === null && 'border-detective-border',
    )}
  >
    {children}
  </div>
);

const InlineFeedback = ({ isCorrect }: { isCorrect: boolean | null }) => {
  if (isCorrect === null) return null;
  return (
    <div className={cn('mt-1 text-xs font-medium', isCorrect ? 'text-detective-success' : 'text-detective-danger')}>
      {isCorrect ? 'Correcto' : 'Incorrecto'}
    </div>
  );
};

export interface MatchingPair {
  id: string;
  itemA: string;
  itemB: string;
  category?: string;
}

export interface MatchingDragDropProps {
  pairs: MatchingPair[];
  connections: Map<string, string>; // itemB id -> itemA id
  onConnect: (itemAId: string, itemBId: string) => void;
  onDisconnect: (itemBId: string) => void;
  showFeedback?: boolean;
  groupALabel?: string;
  groupBLabel?: string;
}

export const MatchingDragDrop = ({
  pairs,
  connections,
  onConnect,
  onDisconnect,
  showFeedback = false,
  groupALabel = 'Grupo A',
  groupBLabel = 'Grupo B',
}: MatchingDragDropProps) => {
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  void draggingItemId; // Marked as intentionally unused

  const handleDrop = (_itemAId: string, _itemBId: string) => {
    onConnect(_itemAId, _itemBId);
    setDraggingItemId(null);
  };

  const isConnectionCorrect = (itemBId: string): boolean | null => {
    if (!showFeedback) return null;
    const connectedItemAId = connections.get(itemBId);
    if (!connectedItemAId) return null;

    const pair = pairs.find((p) => p.id === itemBId);
    return pair?.itemA === connectedItemAId;
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Columna A - Items para arrastrar */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 font-semibold text-detective-text">
          <CategoryBadge />
          {groupALabel}
        </h4>

        <div className="space-y-3">
          {pairs.map((pair, index) => {
            const isConnected = Array.from(connections.values()).includes(pair.id);

            return (
              <motion.div
                key={pair.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DraggableItem
                  id={pair.id}
                  variant="blue"
                  isConnected={isConnected}
                  onDragStart={() => setDraggingItemId(pair.id)}
                  onDragEnd={() => setDraggingItemId(null)}
                >
                  <div className="flex items-start gap-2">
                    <CategoryBadge />
                    <p className="flex-1 text-sm text-detective-text">{pair.itemA}</p>
                  </div>
                </DraggableItem>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Columna B - Zonas de drop */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 font-semibold text-detective-text">
          <CategoryBadge />
          {groupBLabel}
        </h4>

        <div className="space-y-3">
          {pairs.map((pair, index) => {
            const connectedItemAId = connections.get(pair.id);
            const isCorrect = isConnectionCorrect(pair.id);

            // Find the connected item A
            const connectedPair = connectedItemAId
              ? pairs.find((p) => p.id === connectedItemAId)
              : null;

            return (
              <motion.div
                key={pair.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div
                  className={cn(
                    'rounded-lg border-2 p-3 transition-all',
                    'bg-white',
                    isCorrect === true && 'border-green-300 bg-detective-success/10',
                    isCorrect === false && 'border-red-300 bg-detective-danger/10',
                    isCorrect === null && 'border-orange-300',
                  )}
                >
                  <div className="mb-3 flex items-start gap-2">
                    <CategoryBadge />
                    <p className="flex-1 text-sm font-medium text-detective-text">{pair.itemB}</p>
                  </div>

                  {/* Drop Zone */}
                  <DropZone onDrop={() => handleDrop('', pair.id)} isCorrect={isCorrect}>
                    {connectedPair && (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-1 items-start gap-2">
                          <CategoryBadge />
                          <p className="text-sm text-detective-text">{connectedPair.itemA}</p>
                        </div>
                        <button
                          onClick={() => onDisconnect(pair.id)}
                          className="flex-shrink-0 text-detective-text-secondary transition-colors hover:text-gray-600"
                          title="Desconectar"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </DropZone>
                </div>

                {/* Inline Feedback */}
                {showFeedback && connectedItemAId && <InlineFeedback isCorrect={isCorrect} />}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchingDragDrop;
