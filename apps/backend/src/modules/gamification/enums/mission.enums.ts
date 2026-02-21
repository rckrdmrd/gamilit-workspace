/**
 * Mission Type Enum
 * @description Tipos de misiones disponibles
 */
export enum MissionTypeEnum {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  SPECIAL = 'special',
}

/**
 * Mission Status Enum
 * @description Estados del ciclo de vida de una mision
 */
export enum MissionStatusEnum {
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLAIMED = 'claimed',
  EXPIRED = 'expired',
}

/**
 * Mission Objectives Schema
 * @description Estructura de objetivos de la mision
 */
export interface MissionObjective {
  type: string;
  target: number;
  current: number;
  description?: string;
  /** Required exercise type filter (e.g., 'crucigrama', 'detective_textual'). Only exercises of this type count. */
  required_exercise_type?: string;
  /** Required module number filter. Only exercises from this module count. */
  required_module?: number;
}

/**
 * Mission Rewards Schema
 * @description Estructura de recompensas de la mision
 */
export interface MissionRewards {
  ml_coins?: number;
  xp?: number;
  items?: Array<{
    type: string;
    quantity: number;
  }>;
}
