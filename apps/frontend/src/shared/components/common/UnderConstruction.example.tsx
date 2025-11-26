/**
 * UnderConstruction Component - Usage Examples
 *
 * This file provides examples of how to use the UnderConstruction component
 * in different scenarios throughout the application.
 */

import React from 'react';
import { UnderConstruction } from './UnderConstruction';
import { useNavigate } from 'react-router-dom';

/**
 * Example 1: Full Page Variant
 * Use this when an entire page/feature is under construction
 */
export const FullPageExample: React.FC = () => {
  const navigate = useNavigate();

  return (
    <UnderConstruction
      feature="Cosmetics Shop"
      description="The cosmetics shop will allow you to purchase avatars, borders, and effects to personalize your detective profile."
      estimatedDate="Coming in Q1 2025"
      variant="page"
      onBackClick={() => navigate(-1)}
    />
  );
};

/**
 * Example 2: Section Variant
 * Use this for sections within a page that are not yet implemented
 */
export const SectionExample: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Student Dashboard</h1>

      {/* Some working content */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-2 text-xl font-semibold">Welcome Back!</h2>
        <p>Your progress is looking great.</p>
      </div>

      {/* Under construction section */}
      <UnderConstruction
        feature="Cosmetic Items"
        description="This feature is currently in development. You'll soon be able to customize your avatar with exclusive items."
        variant="section"
      />
    </div>
  );
};

/**
 * Example 3: Button Variant
 * Use this for disabled buttons or inline elements
 */
export const ButtonExample: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-6">
      <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
        Active Feature
      </button>

      {/* Button with coming soon badge */}
      <div className="relative inline-block">
        <button
          disabled
          className="cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-gray-500 opacity-50"
        >
          Claim Rewards
        </button>
        <div className="absolute -right-2 -top-2">
          <UnderConstruction feature="Claim Rewards" variant="button" />
        </div>
      </div>
    </div>
  );
};

/**
 * Example 4: Multiple Features Grid
 * Display multiple under construction features in a grid
 */
export const MultipleFeatureExample: React.FC = () => {
  const features = [
    {
      name: 'Cosmetics Shop',
      description: 'Purchase avatars, borders, and effects',
      estimatedDate: 'Q1 2025',
    },
    {
      name: 'Voice Missions',
      description: 'Complete missions using voice commands',
      estimatedDate: 'Q2 2025',
    },
    {
      name: 'Team Competitions',
      description: 'Compete with other teams for rewards',
      estimatedDate: 'Coming Soon',
    },
    {
      name: 'Advanced Analytics',
      description: 'Detailed performance tracking and insights',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Upcoming Features</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <UnderConstruction
            key={feature.name}
            feature={feature.name}
            description={feature.description}
            estimatedDate={feature.estimatedDate}
            variant="section"
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Example 5: Conditional Rendering
 * Show under construction based on feature flags
 */
export const ConditionalExample: React.FC = () => {
  const featureFlags = {
    cosmeticsEnabled: false,
    achievementsEnabled: true,
  };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-bold">Your Profile</h2>

      {/* Conditionally render either the feature or under construction */}
      {featureFlags.cosmeticsEnabled ? (
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="font-semibold">Your Cosmetics</h3>
          {/* Actual cosmetics content */}
        </div>
      ) : (
        <UnderConstruction
          feature="Cosmetics"
          description="Personalize your profile with unique items"
          variant="section"
        />
      )}

      {featureFlags.achievementsEnabled ? (
        <div className="mt-6 rounded-lg bg-white p-4 shadow">
          <h3 className="font-semibold">Your Achievements</h3>
          {/* Actual achievements content */}
        </div>
      ) : (
        <UnderConstruction
          feature="Achievements"
          description="Track your accomplishments"
          variant="section"
        />
      )}
    </div>
  );
};

/**
 * Example 6: Route-based Usage
 * Use in route configuration for unimplemented routes
 */
export const CosmeticsShopPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <UnderConstruction
      feature="Cosmetics Shop"
      description="Browse and purchase exclusive cosmetic items to customize your detective avatar. Stand out from the crowd with unique borders, effects, and accessories!"
      estimatedDate="Coming in Q1 2025"
      variant="page"
      onBackClick={() => navigate('/student/dashboard')}
    />
  );
};
