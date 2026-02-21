import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Modal } from '@shared/components/common/Modal';
import { cn } from '@shared/utils/cn';

interface AvatarSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (avatarUrl: string) => void;
    currentAvatar: string;
}

// Predefined avatar list (using emojis/placeholders for now as per plan)
const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Calista',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Dante',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Elias',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
];

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentAvatar,
}) => {
    // Note: ESC key, scroll lock, and focus trap are handled by Modal component

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            animated
            size="lg"
            showCloseButton={false}
            overlayClassName="bg-black/50 backdrop-blur-sm"
            className="overflow-hidden rounded-xl shadow-2xl"
            contentClassName="custom"
            ariaLabelledBy="avatar-selection-title"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-detective-orange to-orange-600 p-4 text-white">
                <h3 id="avatar-selection-title" className="text-lg font-bold">Elige tu Avatar</h3>
                <button
                    onClick={onClose}
                    className="rounded-full bg-white/20 p-1 hover:bg-white/30 transition-colors"
                    aria-label="Cerrar modal"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Body */}
            <div className="p-6">
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                    {AVATAR_OPTIONS.map((avatar, index) => {
                        const isSelected = currentAvatar === avatar;
                        return (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelect(avatar)}
                                className={cn(
                                    'relative aspect-square overflow-hidden rounded-full border-4 transition-all',
                                    isSelected
                                        ? 'border-detective-orange shadow-lg ring-2 ring-detective-orange/30'
                                        : 'border-transparent hover:border-gray-200'
                                )}
                            >
                                <img
                                    src={avatar}
                                    alt={`Avatar ${index + 1}`}
                                    className="h-full w-full object-cover"
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Check className="h-8 w-8 text-white drop-shadow-md" />
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-100 bg-gray-50 p-4">
                <DetectiveButton variant="secondary" onClick={onClose}>
                    Cancelar
                </DetectiveButton>
            </div>
        </Modal>
    );
};
