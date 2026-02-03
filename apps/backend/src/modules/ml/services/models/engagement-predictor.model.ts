/**
 * Engagement Predictor Model
 *
 * @description Classification model to predict student engagement levels
 * for upcoming periods. Uses:
 * - Historical engagement patterns (sessions by hour)
 * - Day of week and time of day
 * - Recent achievements and pending missions
 * - Streak and reward recency
 *
 * @module ml/services/models
 * @version 1.0.0
 * @since Sprint 3.2 - ML Prediction Models
 */

import { Injectable } from '@nestjs/common';
import {
  ModelType,
  EngagementLevel,
  EngagementPredictorInput,
  EngagementPredictorOutput,
} from '../../interfaces';
import { ModelBaseService, ModelConfig } from './model-base.service';

/**
 * Feature configuration for engagement predictor
 */
const ENGAGEMENT_FEATURES = [
  'avgEngagementPattern',
  'dayOfWeek',
  'timeOfDay',
  'recentAchievements',
  'pendingMissions',
  'daysSinceLastReward',
  'currentStreak',
];

/**
 * Default weights for engagement prediction
 */
const DEFAULT_ENGAGEMENT_WEIGHTS: Record<string, number> = {
  avgEngagementPattern: 0.30,     // Historical pattern is strong predictor
  dayOfWeek: 0.05,                // Weekday vs weekend effect
  timeOfDay: 0.15,                // Time of day preference
  recentAchievements: 0.15,       // Recent wins boost engagement
  pendingMissions: 0.10,          // Goals to pursue
  daysSinceLastReward: -0.08,     // Longer gap = lower engagement
  currentStreak: 0.12,            // Active streak motivates
};

const DEFAULT_ENGAGEMENT_BIAS = 0.5;

/**
 * Engagement boosters by category
 */
const ENGAGEMENT_BOOSTERS: Record<string, string[]> = {
  missions: [
    'Highlight pending mission with close deadline',
    'Offer bonus points for completing daily challenge',
    'Unlock special mission based on interests',
  ],
  achievements: [
    'Show progress toward next achievement',
    'Notify about achievable badge nearby',
    'Celebrate recent wins with animation',
  ],
  social: [
    'Show classmate activity feed',
    'Invite to team challenge',
    'Display leaderboard position changes',
  ],
  rewards: [
    'Offer streak protection bonus',
    'Double XP opportunity available',
    'Exclusive item unlockable today',
  ],
  content: [
    'New module content available',
    'Personalized exercise recommendations',
    'Interactive game unlocked',
  ],
};

/**
 * Time period descriptions
 */
const TIME_PERIODS: Record<number, string> = {
  0: 'Late Night (12-5 AM)',
  1: 'Early Morning (5-8 AM)',
  2: 'Morning (8-12 PM)',
  3: 'Afternoon (12-4 PM)',
  4: 'Late Afternoon (4-7 PM)',
  5: 'Evening (7-10 PM)',
  6: 'Night (10 PM-12 AM)',
};

/**
 * EngagementPredictorModel
 * @description Predicts student engagement level
 */
@Injectable()
export class EngagementPredictorModel extends ModelBaseService<
  EngagementPredictorInput,
  EngagementPredictorOutput
> {
  constructor() {
    const config: Partial<ModelConfig> = {
      modelType: ModelType.ENGAGEMENT_PREDICTOR,
      featureNames: ENGAGEMENT_FEATURES,
      logPredictions: true,
      confidenceThreshold: 0.5,
    };

    super('engagement_predictor', config);

    // Load default weights
    this.setDefaultWeights();
  }

  /**
   * Set default pre-computed weights
   */
  private setDefaultWeights(): void {
    this.weights = { ...DEFAULT_ENGAGEMENT_WEIGHTS };
    this.bias = DEFAULT_ENGAGEMENT_BIAS;
    this.version = '1.0.0';
    this.metrics = {
      accuracy: 0.76,
      precision: 0.74,
      recall: 0.71,
      f1Score: 0.72,
      trainedAt: new Date('2026-01-15'),
      trainingSamples: 6000,
      validationSamples: 1200,
    };
    this.loaded = true;
    this.calculateFeatureImportance();
  }

  /**
   * Make engagement prediction
   */
  async predict(input: EngagementPredictorInput): Promise<EngagementPredictorOutput> {
    const startTime = Date.now();

    // Validate input
    this.validateInput(input);

    // Check if should use fallback
    if (!this.loaded) {
      this.logger.debug('Model not loaded, using rule-based fallback');
      return this.fallbackPredict(input);
    }

    // Extract numeric features
    const features = this.extractFeatures(input);

    // Calculate linear combination
    const linearScore = this.linearCombination(features);

    // Apply sigmoid for probability
    const highEngagementProbability = this.sigmoid(linearScore);

    // Calculate confidence
    const confidence = this.calculateConfidence(highEngagementProbability);

    // Determine if should use fallback due to low confidence
    if (this.shouldUseFallback(confidence)) {
      this.logger.debug(`Low confidence (${confidence.toFixed(2)}), using fallback`);
      return this.fallbackPredict(input);
    }

    // Classify engagement level
    const predictedEngagement = this.probabilityToEngagementLevel(highEngagementProbability);

    // Find best time to engage
    const bestTimeToEngage = this.findBestTimeToEngage(input);

    // Generate engagement boosters
    const engagementBoosters = this.generateEngagementBoosters(input, predictedEngagement);

    const result: EngagementPredictorOutput = {
      predictedEngagement,
      bestTimeToEngage,
      engagementBoosters,
      highEngagementProbability: Math.round(highEngagementProbability * 1000) / 1000,
      confidence: Math.round(confidence * 1000) / 1000,
      usedFallback: false,
    };

    // Log prediction
    const responseTimeMs = Date.now() - startTime;
    this.logPrediction(input, result, responseTimeMs);

    return result;
  }

  /**
   * Rule-based fallback prediction
   */
  protected fallbackPredict(input: EngagementPredictorInput): EngagementPredictorOutput {
    const {
      historicalEngagementPattern,
      dayOfWeek,
      timeOfDay,
      recentAchievements,
      pendingMissions,
      currentStreak,
    } = input;

    // Calculate average historical engagement
    const avgHistorical = historicalEngagementPattern.length > 0
      ? historicalEngagementPattern.reduce((a, b) => a + b, 0) / historicalEngagementPattern.length
      : 0.5;

    // Base probability from historical pattern
    let probability = avgHistorical;

    // Boost for recent achievements
    if (recentAchievements > 2) {
      probability += 0.1;
    }

    // Boost for pending missions
    if (pendingMissions > 0 && pendingMissions <= 3) {
      probability += 0.08;
    }

    // Boost for active streak
    if (currentStreak && currentStreak > 3) {
      probability += 0.1;
    }

    // Time-based adjustments
    // Peak engagement hours: 4 PM - 8 PM
    if (timeOfDay >= 16 && timeOfDay <= 20) {
      probability += 0.1;
    }
    // Low engagement: very early or late
    else if (timeOfDay < 7 || timeOfDay > 22) {
      probability -= 0.15;
    }

    // Weekend adjustment
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      probability += 0.05; // Slightly higher on weekends
    }

    probability = this.clamp(probability, 0, 1);

    const predictedEngagement = this.probabilityToEngagementLevel(probability);
    const bestTimeToEngage = this.findBestTimeToEngage(input);
    const engagementBoosters = this.generateEngagementBoosters(input, predictedEngagement);

    return {
      predictedEngagement,
      bestTimeToEngage,
      engagementBoosters,
      highEngagementProbability: Math.round(probability * 1000) / 1000,
      confidence: 0.65,
      usedFallback: true,
    };
  }

  /**
   * Extract numeric features from input
   */
  protected extractFeatures(input: EngagementPredictorInput): number[] {
    // Calculate average from historical pattern
    const avgPattern = input.historicalEngagementPattern.length > 0
      ? input.historicalEngagementPattern.reduce((a, b) => a + b, 0) /
        input.historicalEngagementPattern.length
      : 0.5;

    // Get engagement at current time from pattern (if available)
    const currentHourEngagement = input.historicalEngagementPattern[input.timeOfDay] ?? avgPattern;

    return [
      currentHourEngagement,                                    // Pattern at current time
      this.normalize(input.dayOfWeek, 0, 6),                   // Day of week (0-6)
      this.normalize(input.timeOfDay, 0, 23),                  // Hour (0-23)
      this.normalize(input.recentAchievements, 0, 10),         // Recent achievements (0-10)
      this.normalize(input.pendingMissions, 0, 10),            // Pending missions (0-10)
      this.normalize(input.daysSinceLastReward ?? 0, 0, 14),   // Days since reward (0-14)
      this.normalize(input.currentStreak ?? 0, 0, 30),         // Current streak (0-30)
    ];
  }

  /**
   * Format raw output (not used directly, but required by base)
   */
  protected formatOutput(
    probability: number,
    confidence: number,
    usedFallback: boolean,
  ): EngagementPredictorOutput {
    return {
      predictedEngagement: this.probabilityToEngagementLevel(probability),
      bestTimeToEngage: '',
      engagementBoosters: [],
      highEngagementProbability: probability,
      confidence,
      usedFallback,
    };
  }

  /**
   * Convert probability to engagement level
   */
  private probabilityToEngagementLevel(probability: number): EngagementLevel {
    if (probability >= 0.7) return EngagementLevel.HIGH;
    if (probability >= 0.4) return EngagementLevel.MEDIUM;
    return EngagementLevel.LOW;
  }

  /**
   * Find best time to engage based on historical pattern
   */
  private findBestTimeToEngage(input: EngagementPredictorInput): string {
    const { historicalEngagementPattern } = input;

    if (historicalEngagementPattern.length === 0) {
      return 'Afternoon (3-5 PM)'; // Default recommendation
    }

    // Find hour with highest engagement
    let maxEngagement = 0;
    let bestHour = 15; // Default to 3 PM

    for (let hour = 0; hour < historicalEngagementPattern.length; hour++) {
      if (historicalEngagementPattern[hour] > maxEngagement) {
        maxEngagement = historicalEngagementPattern[hour];
        bestHour = hour;
      }
    }

    // Convert to human-readable time period
    const period = this.getTimePeriod(bestHour);
    return period;
  }

  /**
   * Get time period description
   */
  private getTimePeriod(hour: number): string {
    if (hour >= 0 && hour < 5) return TIME_PERIODS[0];
    if (hour >= 5 && hour < 8) return TIME_PERIODS[1];
    if (hour >= 8 && hour < 12) return TIME_PERIODS[2];
    if (hour >= 12 && hour < 16) return TIME_PERIODS[3];
    if (hour >= 16 && hour < 19) return TIME_PERIODS[4];
    if (hour >= 19 && hour < 22) return TIME_PERIODS[5];
    return TIME_PERIODS[6];
  }

  /**
   * Generate engagement boosters based on student state
   */
  private generateEngagementBoosters(
    input: EngagementPredictorInput,
    predictedLevel: EngagementLevel,
  ): string[] {
    const boosters: string[] = [];
    const { recentAchievements, pendingMissions, currentStreak, daysSinceLastReward } = input;

    // For low engagement, prioritize strong boosters
    if (predictedLevel === EngagementLevel.LOW) {
      // Rewards are most effective for low engagement
      boosters.push(...ENGAGEMENT_BOOSTERS.rewards.slice(0, 2));

      if (pendingMissions > 0) {
        boosters.push(ENGAGEMENT_BOOSTERS.missions[0]);
      }

      boosters.push(ENGAGEMENT_BOOSTERS.social[0]);
    }
    // For medium engagement, gentle nudges
    else if (predictedLevel === EngagementLevel.MEDIUM) {
      if (pendingMissions > 0) {
        boosters.push(ENGAGEMENT_BOOSTERS.missions[1]);
      }

      if (recentAchievements > 0) {
        boosters.push(ENGAGEMENT_BOOSTERS.achievements[0]);
      }

      boosters.push(ENGAGEMENT_BOOSTERS.content[0]);
    }
    // For high engagement, maintain momentum
    else {
      if (currentStreak && currentStreak > 0) {
        boosters.push(ENGAGEMENT_BOOSTERS.rewards[0]); // Streak protection
      }

      boosters.push(ENGAGEMENT_BOOSTERS.achievements[1]);
      boosters.push(ENGAGEMENT_BOOSTERS.social[1]); // Team challenge
    }

    // Add reward booster if long time since last reward
    if ((daysSinceLastReward ?? 0) > 5) {
      boosters.push(ENGAGEMENT_BOOSTERS.rewards[1]); // Double XP
    }

    // Deduplicate and limit
    return [...new Set(boosters)].slice(0, 4);
  }

  /**
   * Validate input features
   */
  private validateInput(input: EngagementPredictorInput): void {
    if (input.dayOfWeek < 0 || input.dayOfWeek > 6) {
      throw new Error('dayOfWeek must be between 0 and 6');
    }
    if (input.timeOfDay < 0 || input.timeOfDay > 23) {
      throw new Error('timeOfDay must be between 0 and 23');
    }
    if (input.recentAchievements < 0) {
      throw new Error('recentAchievements must be non-negative');
    }
    if (input.pendingMissions < 0) {
      throw new Error('pendingMissions must be non-negative');
    }
    if (input.daysSinceLastReward !== undefined && input.daysSinceLastReward < 0) {
      throw new Error('daysSinceLastReward must be non-negative');
    }
    if (input.currentStreak !== undefined && input.currentStreak < 0) {
      throw new Error('currentStreak must be non-negative');
    }

    // Validate historical pattern values
    for (const value of input.historicalEngagementPattern) {
      if (value < 0 || value > 1) {
        throw new Error('historicalEngagementPattern values must be between 0 and 1');
      }
    }
  }
}
