import { CheckCircle2, Circle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { WordPosition } from './sopaLetrasTypes';

export const WordList = ({ words }: { words: WordPosition[] }) => (
  <DetectiveCard variant="default" padding="md">
    <h3 className="font-bold mb-4">Palabras a encontrar</h3>
    <div className="space-y-2">
      {words.map(w => (
        <div key={w.word} className="flex items-center gap-2">
          {w.found ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-detective-text-secondary" />}
          <span className={w.found ? 'line-through text-detective-text-secondary' : 'font-medium'}>{w.word}</span>
        </div>
      ))}
    </div>
  </DetectiveCard>
);
