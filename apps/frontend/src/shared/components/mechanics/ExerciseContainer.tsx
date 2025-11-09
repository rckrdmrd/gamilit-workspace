/**
 * Exercise Container Component
 * Wrapper component for exercises with common functionality
 *
 * TODO: Stub component - needs full implementation
 */

import React from 'react';

export interface ExerciseContainerProps {
  children: React.ReactNode;
  title?: string;
  instructions?: string;
  onComplete?: () => void;
  className?: string;
}

export const ExerciseContainer: React.FC<ExerciseContainerProps> = ({
  children,
  title,
  instructions,
  className = '',
}) => {
  return (
    <div className={`exercise-container bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      )}
      {instructions && (
        <p className="text-gray-600 mb-6">{instructions}</p>
      )}
      <div className="exercise-content">{children}</div>
    </div>
  );
};

export default ExerciseContainer;
