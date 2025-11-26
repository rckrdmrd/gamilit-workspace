import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ZoomIn, ZoomOut } from 'lucide-react';

interface MagnifyingGlassProps {
  text: string;
  onDiscoverClue?: (clue: string) => void;
}

export const MagnifyingGlass: React.FC<MagnifyingGlassProps> = ({ text }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (active) {
      const rect = e.currentTarget.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setActive(!active)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
            active ? 'bg-detective-orange text-white' : 'bg-white text-detective-text'
          }`}
        >
          <Search className="h-4 w-4" />
          {active ? 'Desactivar Lupa' : 'Activar Lupa'}
        </button>
        {active && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(1, zoom - 0.5))}
              className="rounded-lg bg-white p-2"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-detective-sm">{zoom}x</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.5))}
              className="rounded-lg bg-white p-2"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div
        onMouseMove={handleMouseMove}
        className={`relative rounded-lg border-2 bg-white p-6 ${active ? 'border-detective-orange' : 'border-gray-200'} ${active ? 'cursor-none' : 'cursor-text'}`}
        style={{ lineHeight: '1.8' }}
      >
        <p className="text-detective-base text-detective-text">{text}</p>
        {active && (
          <motion.div
            className="pointer-events-none absolute"
            animate={{ x: position.x - 50, y: position.y - 50 }}
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '3px solid #f97316',
              background: 'rgba(249, 115, 22, 0.1)',
              backdropFilter: 'blur(2px)',
            }}
          />
        )}
      </div>
    </div>
  );
};
