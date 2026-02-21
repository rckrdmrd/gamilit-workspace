import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemeAnnotation } from './analisisMemesTypes';
import { MessageCircle } from 'lucide-react';

export const AnnotationMarker: React.FC<{ annotation: MemeAnnotation }> = ({ annotation }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{ left: annotation.x, top: annotation.y }}
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
    >
      <div className="relative">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center cursor-pointer border-none outline-none"
          aria-label={`Anotacion: ${annotation.category} - ${annotation.text}`}
          aria-expanded={isOpen}
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-white p-3 rounded-lg shadow-lg border-2 border-detective-danger z-10"
            >
              <p className="text-sm font-semibold mb-1">{annotation.category}</p>
              <p className="text-xs text-detective-text">{annotation.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
