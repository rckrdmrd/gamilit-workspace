/**
 * WheelSpinner Component
 *
 * @description Animated spinning wheel for category selection
 * @task FE-071
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { WheelSpinnerProps } from './ruedaInferenciasTypes';

export const WheelSpinner = ({
  categories,
  isSpinning,
  onSpinComplete,
  usedCategoryIds,
}: WheelSpinnerProps) => {
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const hasCalledOnComplete = useRef(false);

  // Calculate segment angle
  const segmentAngle = 360 / categories.length;

  /* eslint-disable react-hooks/exhaustive-deps */
  // NOTA: usedCategoryIds NO debe ser dependencia para evitar race condition
  // que causa duplicación de IDs. Ver: orchestration/agentes/architecture-analyst/rueda-inferencias-bugs-2025-11-23/
  useEffect(() => {
    if (isSpinning) {
      hasCalledOnComplete.current = false; // Reset al empezar

      // Filter out already used categories
      const availableCategories = categories.filter(
        cat => !usedCategoryIds?.includes(cat.id)
      );

      // If no available categories (edge case), use all
      const selectableCategories = availableCategories.length > 0
        ? availableCategories
        : categories;

      // Randomly select from available categories
      const randomIndex = Math.floor(Math.random() * selectableCategories.length);
      const selectedCategory = selectableCategories[randomIndex];

      // Find index in original categories array for visual rotation
      const visualIndex = categories.findIndex(cat => cat.id === selectedCategory.id);
      const targetAngle = visualIndex * segmentAngle;

      // Generate rotation to land on target angle
      const fullRotations = 3 + Math.random() * 2; // 3-5 full rotations
      const totalRotation = rotation + (fullRotations * 360) + targetAngle;

      setRotation(totalRotation);

      // Complete spin after animation
      setTimeout(() => {
        setSelectedIndex(visualIndex);

        // SOLO llamar onSpinComplete UNA vez
        if (!hasCalledOnComplete.current) {
          hasCalledOnComplete.current = true;
          onSpinComplete(selectedCategory);
        }
      }, 3000);
    }
  }, [isSpinning]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wheel Container */}
      <div className="relative w-60 h-60 sm:w-80 sm:h-80">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-red-500 drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-8 border-detective-gold"
          animate={{ rotate: rotation }}
          transition={{
            duration: isSpinning ? 3 : 0,
            ease: isSpinning ? [0.25, 0.1, 0.25, 1] : 'linear',
          }}
        >
          {categories.map((category, index) => {
            const angle = index * segmentAngle;
            const isSelected = selectedIndex === index && !isSpinning;

            return (
              <div
                key={category.id}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'center',
                }}
              >
                <div
                  className={`absolute w-1/2 h-1/2 origin-bottom-right flex items-end justify-center pb-4 pr-4 transition-all ${
                    isSelected ? 'scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: category.color,
                    clipPath: `polygon(100% 100%, 0% 100%, 50% 0%)`,
                    transform: `rotate(${segmentAngle / 2}deg)`,
                  }}
                >
                  <div
                    className="text-white font-bold text-center"
                    style={{
                      transform: `rotate(-${angle + segmentAngle / 2}deg)`,
                      fontSize: '0.875rem',
                      lineHeight: '1.2',
                      maxWidth: '80px',
                    }}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div>{category.name}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Center Circle */}
          <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full border-4 border-detective-gold shadow-lg flex items-center justify-center">
            <div className="text-2xl">🎯</div>
          </div>
        </motion.div>
      </div>

      {/* Selected Category Display */}
      {selectedIndex !== null && !isSpinning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-3 sm:p-6 border-4 border-blue-500 max-w-md"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">{categories[selectedIndex].icon}</div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">
              {categories[selectedIndex].name}
            </h3>
            <p className="text-detective-text-secondary text-sm">
              {categories[selectedIndex].description}
            </p>
          </div>
        </motion.div>
      )}

      {/* Spin Status */}
      {isSpinning && (
        <div className="bg-detective-gold/10 border-2 border-detective-gold rounded-lg px-6 py-3">
          <p className="text-yellow-800 font-semibold text-center">
            🎪 ¡Girando la ruleta...!
          </p>
        </div>
      )}
    </div>
  );
};
