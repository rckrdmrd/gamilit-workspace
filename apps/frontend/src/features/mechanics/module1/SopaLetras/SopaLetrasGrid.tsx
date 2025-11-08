import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@shared/utils/cn';

export const SopaLetrasGrid: React.FC<{ grid: string[][]; selectedCells: {row:number,col:number}[]; onCellSelect: (r:number,c:number) => void }> = ({ grid, selectedCells, onCellSelect }) => {
  const isSelected = (r: number, c: number) => selectedCells.some(cell => cell.row === r && cell.col === c);

  return (
    <div className="inline-block bg-white p-4 rounded-lg shadow-lg">
      <div className="grid gap-1">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {row.map((letter, colIdx) => (
              <motion.button
                key={`${rowIdx}-${colIdx}`}
                whileHover={{ scale: 1.1 }}
                onClick={() => onCellSelect(rowIdx, colIdx)}
                className={cn('w-10 h-10 flex items-center justify-center font-bold text-lg rounded', isSelected(rowIdx, colIdx) ? 'bg-green-200 text-green-800' : 'bg-gray-100 hover:bg-gray-200')}
              >
                {letter}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
