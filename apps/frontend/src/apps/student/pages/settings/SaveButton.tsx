import React from 'react';
import { motion } from 'framer-motion';
import { Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveButtonProps {
  status: SaveStatus;
  onClick: () => void;
  idleLabel?: string;
  idleIcon?: React.ReactNode;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  status,
  onClick,
  idleLabel = 'Guardar Cambios',
  idleIcon,
}) => (
  <motion.button
    onClick={onClick}
    disabled={status === 'saving'}
    whileHover={status === 'idle' ? { scale: 1.02 } : {}}
    whileTap={status === 'idle' ? { scale: 0.98 } : {}}
    className={cn(
      'flex items-center gap-2 rounded-lg px-6 py-3 font-medium shadow-md transition-all',
      status === 'saving' && 'cursor-not-allowed bg-gray-400 text-white',
      status === 'saved' && 'bg-green-500 text-white',
      status === 'error' && 'bg-red-500 text-white',
      status === 'idle' &&
        'bg-detective-orange text-white hover:bg-detective-orange-dark hover:shadow-lg',
    )}
  >
    {status === 'saving' ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Guardando...</span>
      </>
    ) : status === 'saved' ? (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2"
      >
        <Check className="h-5 w-5" />
        <span>Guardado</span>
      </motion.div>
    ) : status === 'error' ? (
      <>
        <AlertCircle className="h-4 w-4" />
        <span>Error</span>
      </>
    ) : (
      <>
        {idleIcon || <Save className="h-4 w-4" />}
        <span>{idleLabel}</span>
      </>
    )}
  </motion.button>
);
