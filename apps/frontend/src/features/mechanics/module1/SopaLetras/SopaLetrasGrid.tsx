import { motion } from 'framer-motion';
import { cn } from '@shared/utils/cn';

interface SopaLetrasGridProps {
  grid: string[][];
  selectedCells: {row:number,col:number}[];
  foundCells?: {row:number,col:number}[]; // Celdas de palabras ya encontradas
  onCellSelect: (r:number,c:number) => void;
  cellSize?: number;
}

export const SopaLetrasGrid = ({
  grid,
  selectedCells,
  foundCells = [],
  onCellSelect,
  cellSize = 40,
}: SopaLetrasGridProps) => {
  const fontSize = Math.max(10, Math.floor(cellSize * 0.45));
  const enableHover = cellSize >= 36;
  const isSelected = (r: number, c: number) => selectedCells.some(cell => cell.row === r && cell.col === c);
  const isFound = (r: number, c: number) => foundCells.some(cell => cell.row === r && cell.col === c);

  const getCellStyle = (r: number, c: number): string => {
    // Prioridad 1: Celdas actualmente seleccionadas (temporal - más alta prioridad)
    if (isSelected(r, c)) {
      return 'bg-green-400 text-white font-bold border-2 border-green-600';
    }
    // Prioridad 2: Celdas de palabras ya encontradas (permanente - pueden reutilizarse)
    if (isFound(r, c)) {
      return 'bg-detective-orange/30 text-detective-text font-bold hover:bg-detective-orange/40';
    }
    // Prioridad 3: Celdas normales
    return 'bg-detective-bg-secondary hover:bg-gray-200 text-detective-text';
  };

  return (
    <div className="inline-block bg-white p-2 sm:p-4 rounded-lg shadow-lg">
      <div className="grid gap-1">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {row.map((letter, colIdx) => (
              <motion.button
                key={`${rowIdx}-${colIdx}`}
                whileHover={enableHover ? { scale: 1.1 } : undefined}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCellSelect(rowIdx, colIdx)}
                onContextMenu={(e) => {
                  e.preventDefault();
                }}
                style={{ width: cellSize, height: cellSize, fontSize }}
                className={cn(
                  'flex items-center justify-center font-bold rounded transition-colors',
                  getCellStyle(rowIdx, colIdx)
                )}
              >
                {letter}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1">
        <div className="text-sm font-medium text-detective-text text-center">
          Controles:
        </div>
        <div className="text-xs text-detective-text-secondary text-center space-y-0.5">
          <div>• Haz click en las letras para seleccionar</div>
          <div>• <kbd className="px-1.5 py-0.5 bg-detective-bg-secondary rounded text-xs font-mono">ENTER</kbd> valida la palabra seleccionada</div>
          <div>• <kbd className="px-1.5 py-0.5 bg-detective-bg-secondary rounded text-xs font-mono">ESC</kbd> limpia la selección</div>
          <div className="text-detective-orange font-medium mt-1">💡 Las letras resaltadas pueden reutilizarse</div>
        </div>
      </div>
    </div>
  );
};
