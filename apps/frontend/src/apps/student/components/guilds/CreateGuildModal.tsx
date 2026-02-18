import { useState } from 'react';
import { Modal } from '@shared/components/common/Modal';

interface CreateGuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; isPublic: boolean; requirements: { minLevel: number } }) => void;
}

export function CreateGuildModal({ isOpen, onClose, onSubmit }: CreateGuildModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [minLevel, setMinLevel] = useState(1);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name, description, isPublic, requirements: { minLevel } });
    setName('');
    setDescription('');
    setIsPublic(true);
    setMinLevel(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Guild">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-detective-text">
            Guild Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border-2 border-detective-orange/30 px-4 py-2 focus:border-detective-orange focus:outline-none"
            placeholder="Enter guild name..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-detective-text">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border-2 border-detective-orange/30 px-4 py-2 focus:border-detective-orange focus:outline-none"
            rows={3}
            placeholder="Describe your guild..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-detective-text">
            Minimum Level Requirement
          </label>
          <input
            type="number"
            min="1"
            value={minLevel}
            onChange={(e) => setMinLevel(parseInt(e.target.value) || 1)}
            className="w-full rounded-lg border-2 border-detective-orange/30 px-4 py-2 focus:border-detective-orange focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
          />
          <label htmlFor="isPublic" className="text-sm text-detective-text">
            Make guild public (anyone can join)
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-detective-text transition-colors hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 rounded-lg bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark disabled:opacity-50"
          >
            Create Guild
          </button>
        </div>
      </div>
    </Modal>
  );
}
