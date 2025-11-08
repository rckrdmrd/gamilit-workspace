import React, { useState } from 'react';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { ExerciseContentEditor } from '../components/content/ExerciseContentEditor';
import { MediaLibraryManager } from '../components/content/MediaLibraryManager';
import { ContentApprovalQueue } from '../components/content/ContentApprovalQueue';
import { ContentVersionControl } from '../components/content/ContentVersionControl';

const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exercises' | 'media' | 'approvals' | 'versions'>('exercises');

  const tabs = [
    { id: 'exercises' as const, label: 'Exercise Editor', component: ExerciseContentEditor },
    { id: 'media' as const, label: 'Media Library', component: MediaLibraryManager },
    { id: 'approvals' as const, label: 'Approval Queue', component: ContentApprovalQueue },
    { id: 'versions' as const, label: 'Version Control', component: ContentVersionControl },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || ExerciseContentEditor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <GamifiedHeader user={{ email: 'admin@glit.com' }} />

      <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-detective-title mb-2">Content Management</h1>
          <p className="text-detective-base text-gray-400">Manage educational content, media, and approvals</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-gray-400 hover:bg-detective-bg-secondary/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <ActiveComponent />
      </main>
    </div>
  );
};

export default ContentManagement;
