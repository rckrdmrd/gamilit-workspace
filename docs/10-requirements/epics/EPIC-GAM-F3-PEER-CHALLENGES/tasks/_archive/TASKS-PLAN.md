# Plan de Tareas -- EPIC-GAM-F3-PEER-CHALLENGES
Estado: PLANIFICADO | US: 3 | SP Total: 25 | Impl: 50%

## Tareas Planificadas

| # | Tarea | Area | US Relacionadas | SP Est. | Prioridad |
|---|-------|------|-----------------|---------|-----------|
| 1 | API challenges: CRUD, inbox, accept/decline, auto-expiracion 24h | Backend | US-PEER-001 | 3 | P1 |
| 2 | Matching system: buscar oponente por nivel similar si no especificado | Backend | US-PEER-001 | 2 | P1 |
| 3 | UI creacion challenge: modal selector ejercicio + slider apuesta ML Coins | Frontend | US-PEER-001 | 2 | P1 |
| 4 | WebSocket: notificaciones challenge recibido + updates progreso real-time | Backend | US-PEER-002 | 3 | P1 |
| 5 | Versus screen: progreso lado-a-lado durante ejecucion del ejercicio | Frontend | US-PEER-002 | 2 | P1 |
| 6 | Results screen: ganador, stats comparativas, animaciones | Frontend | US-PEER-002 | 1 | P1 |
| 7 | Scoring engine: determinar ganador + ML Coins wagering/payout | Backend | US-PEER-003 | 3 | P2 |
| 8 | Historial challenges + leaderboard de victorias entre amigos | Fullstack | US-PEER-003 | 2 | P2 |
| 9 | Tests: concurrencia challenges, edge cases (empate, timeout, desconexion) | Testing | Todas | 2 | P1 |

## Dependencias
- Requiere: Gamificacion ML Coins funcional, WebSocket infrastructure, social features (friendships)
- Bloquea: Nada directamente (feature social standalone)
