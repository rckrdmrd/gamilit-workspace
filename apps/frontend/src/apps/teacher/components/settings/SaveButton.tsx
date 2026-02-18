import React from 'react';
import { motion } from 'framer-motion';
import { Save, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface SaveButtonProps {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
}

export function SaveButton({ saveStatus, onClick, label = 'Guardar Cambios', icon }: SaveButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={saveStatus === 'saving'}
      whileHover={saveStatus === 'idle' ? { scale: 1.02 } : {}}
      whileTap={saveStatus === 'idle' ? { scale: 0.98 } : {}}
      className={cn(
        'flex items-center gap-2 rounded-lg px-6 py-3 font-medium shadow-md transition-all',
        saveStatus === 'saving' && 'cursor-not-allowed bg-gray-400',
        saveStatus === 'saved' && 'bg-green-500 text-white',
        saveStatus === 'error' && 'bg-red-500 text-white',
        saveStatus === 'idle' &&
          'bg-detective-orange text-white hover:bg-detective-orange-dark hover:shadow-lg',
      )}
    >
      {saveStatus === 'saving' ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Guardando...</span>
        </>
      ) : saveStatus === 'saved' ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2"
        >
          <Check className="h-5 w-5" />
          <span>¡Guardado!</span>
        </motion.div>
      ) : saveStatus === 'error' ? (
        <>
          <AlertCircle className="h-4 w-4" />
          <span>Error</span>
        </>
      ) : (
        <>
          {icon || <Save className="h-4 w-4" />}
          <span>{label}</span>
        </>
      )}
    </motion.button>
  );
}
