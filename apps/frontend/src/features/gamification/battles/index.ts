/**
 * Battles Module - Barrel Export
 *
 * @module battles
 * @description Peer-to-peer battle system for GAMILIT (EXT-009)
 *
 * Features:
 * - Skill-based matchmaking
 * - Real-time battle arena
 * - Score tracking and results
 * - WebSocket integration
 */

// Components
export { BattleMatchmaking, BattleArena, BattleResults } from './components';

// Hooks
export { useBattle } from './hooks/useBattle';

// Store
export { useBattleStore } from './store/battleStore';

// Types
export * from './types/battleTypes';
