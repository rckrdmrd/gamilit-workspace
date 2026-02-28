---
titulo: "ET-PEER-002: Realtime Battles"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-PEER-002: Realtime Battles

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PEER-002 |
| **Modulo** | Peer Challenges |
| **Titulo** | Sistema de Batallas en Tiempo Real |
| **Prioridad** | Media |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 25% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 25%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| PeerChallenge Entity | COMPLETO | 100% |
| Challenge Status Management | COMPLETO | 100% |
| WebSocket Infrastructure | EXISTENTE | 80% |
| Battle Session Management | NO INICIADO | 0% |
| Real-time Sync Service | NO INICIADO | 0% |
| Battle UI Components | NO INICIADO | 0% |
| Countdown/Timer System | NO INICIADO | 0% |
| Live Score Updates | NO INICIADO | 0% |
| Victory/Defeat Screens | NO INICIADO | 0% |

---

## Referencias

### Requerimiento Funcional
- RF-PEER-002: 1v1 Challenge Execution

### User Stories
- [US-PEER-002: Challenge Execution](../user-stories/US-PEER-002/US-PEER-002-challenge-execution.md)

### Dependencias
- ET-PEER-001: Matchmaking System

---

## Descripcion Funcional

El sistema de batallas en tiempo real permite que dos o mas estudiantes compitan simultaneamente en ejercicios de comprension lectora, con:
- Sincronizacion en tiempo real del progreso
- Contadores de tiempo compartidos
- Actualizaciones de score en vivo
- Notificaciones de eventos (respuesta correcta, power-ups, etc.)

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - (FALTANTE) BattleArena                                |
|  - (FALTANTE) OpponentProgressBar                        |
|  - (FALTANTE) LiveScoreDisplay                           |
|  - (FALTANTE) BattleTimer                                |
|  - (FALTANTE) VictoryScreen / DefeatScreen               |
+-----------------------------+----------------------------+
                              | WebSocket (Socket.IO)
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - (FALTANTE) BattleGateway                              |
|  - (FALTANTE) BattleSessionService                       |
|  - PeerChallengesService (EXISTENTE)                     |
|  - ExerciseExecutionService (EXISTENTE)                  |
+-----------------------------+----------------------------+
                              | Redis
+-----------------------------v----------------------------+
|               CACHE / SESSION                             |
|  - battle:{id}:state                                     |
|  - battle:{id}:player1                                   |
|  - battle:{id}:player2                                   |
+----------------------------------------------------------+
```

### Flujo de Batalla

```
Challenge inicia (status: 'in_progress')
        |
        v
BattleSessionService.initBattle(challengeId)
  - Crear session en Redis
  - Cargar ejercicio para ambos
  - Iniciar countdown (3, 2, 1)
        |
        v
WebSocket: battle:start
  - Ambos jugadores reciben ejercicio
  - Timer inicia (configurable, default: 5 min)
        |
        v
[Loop de Batalla]
  Player responde → WebSocket: battle:answer
        |
        v
  BattleSessionService.processAnswer()
    - Validar respuesta
    - Calcular puntos
    - Actualizar estado en Redis
        |
        v
  WebSocket: battle:scoreUpdate (a ambos)
    - Score actual de ambos
    - Progreso (preguntas respondidas)
        |
        v
[Fin de Batalla]
  - Tiempo agotado O ambos terminaron
        |
        v
BattleSessionService.finalizeBattle()
  - Calcular ganador
  - Actualizar PeerChallenge (status: 'completed')
  - Actualizar skill ratings
  - Distribuir recompensas
        |
        v
WebSocket: battle:end
  - Resultado final
  - Estadisticas
  - XP/Coins ganados
```

---

## Implementacion Existente

### Challenge Status Management

**Ubicacion:** `apps/backend/src/modules/social/services/peer-challenges.service.ts`

**Estado:** COMPLETO (100%)

**Transiciones de Estado Soportadas:**
```
open → full → in_progress → completed
open → cancelled
open → expired
full → cancelled
full → expired
in_progress → completed
in_progress → cancelled
```

### WebSocket Infrastructure

**Ubicacion:** `apps/backend/src/modules/notifications/gateways/`

**Estado:** PARCIAL (existente para notificaciones)

**Capacidades Existentes:**
- Conexion autenticada via JWT
- Rooms por usuario
- Broadcast a grupos
- Reconexion automatica

---

## Lo que Falta para Completar (75%)

### 1. BattleGateway (25% de lo faltante)

```typescript
// gateways/battle.gateway.ts (NUEVO)
@WebSocketGateway({ namespace: '/battle' })
export class BattleGateway implements OnGatewayConnection, OnGatewayDisconnect {

  /**
   * Jugador se une a la batalla
   */
  @SubscribeMessage('battle:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { challengeId: string }
  ): Promise<BattleState>;

  /**
   * Jugador indica que esta listo
   */
  @SubscribeMessage('battle:ready')
  async handleReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { challengeId: string }
  ): Promise<void>;

  /**
   * Jugador envia respuesta
   */
  @SubscribeMessage('battle:answer')
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: BattleAnswerDto
  ): Promise<AnswerResult>;

  /**
   * Jugador usa power-up
   */
  @SubscribeMessage('battle:powerup')
  async handlePowerUp(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PowerUpDto
  ): Promise<void>;

  /**
   * Jugador se desconecta
   */
  handleDisconnect(client: Socket): Promise<void>;

  /**
   * Broadcast de evento a todos en la batalla
   */
  broadcastToBattle(challengeId: string, event: string, data: any): void;

  /**
   * Inicia countdown de batalla
   */
  startCountdown(challengeId: string): void;

  /**
   * Notifica fin de batalla
   */
  notifyBattleEnd(challengeId: string, result: BattleResult): void;
}
```

### 2. BattleSessionService (25% de lo faltante)

```typescript
// services/battle-session.service.ts (NUEVO)
@Injectable()
export class BattleSessionService {
  constructor(
    private readonly redisService: RedisService,
    private readonly peerChallengesService: PeerChallengesService,
    private readonly exerciseService: ExerciseService,
    private readonly skillRatingService: SkillRatingService,
    private readonly gamificationService: GamificationService,
  ) {}

  /**
   * Inicializa sesion de batalla en Redis
   */
  async initBattle(challengeId: string): Promise<BattleSession>;

  /**
   * Obtiene estado actual de la batalla
   */
  async getBattleState(challengeId: string): Promise<BattleState>;

  /**
   * Marca jugador como listo
   */
  async setPlayerReady(challengeId: string, playerId: string): Promise<boolean>;

  /**
   * Verifica si todos estan listos para iniciar
   */
  async areAllPlayersReady(challengeId: string): Promise<boolean>;

  /**
   * Procesa respuesta de un jugador
   */
  async processAnswer(
    challengeId: string,
    playerId: string,
    questionId: string,
    answer: string
  ): Promise<AnswerResult>;

  /**
   * Obtiene siguiente pregunta para jugador
   */
  async getNextQuestion(
    challengeId: string,
    playerId: string
  ): Promise<Question | null>;

  /**
   * Verifica si la batalla termino
   */
  async checkBattleEnd(challengeId: string): Promise<boolean>;

  /**
   * Finaliza batalla y calcula resultados
   */
  async finalizeBattle(challengeId: string): Promise<BattleResult>;

  /**
   * Distribuye recompensas
   */
  async distributeRewards(
    challengeId: string,
    result: BattleResult
  ): Promise<RewardsDistribution>;

  /**
   * Maneja desconexion de jugador
   */
  async handlePlayerDisconnect(
    challengeId: string,
    playerId: string
  ): Promise<void>;

  /**
   * Limpia sesion de batalla
   */
  async cleanupBattle(challengeId: string): Promise<void>;
}

interface BattleSession {
  challengeId: string;
  players: BattlePlayer[];
  exercise: Exercise;
  questions: Question[];
  currentQuestionIndex: Map<string, number>;
  scores: Map<string, number>;
  status: 'waiting' | 'countdown' | 'active' | 'finished';
  startedAt: Date | null;
  endsAt: Date | null;
  timeLimit: number; // segundos
}

interface BattlePlayer {
  id: string;
  displayName: string;
  avatarUrl: string;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  lastActivityAt: Date;
}

interface BattleState {
  session: BattleSession;
  myScore: number;
  opponentScore: number;
  timeRemaining: number;
  currentQuestion: Question | null;
}

interface BattleResult {
  challengeId: string;
  winnerId: string | null; // null si empate
  players: {
    id: string;
    score: number;
    correctAnswers: number;
    totalAnswers: number;
    accuracy: number;
    avgTimePerQuestion: number;
    xpEarned: number;
    coinsEarned: number;
    ratingChange: number;
  }[];
  isDraw: boolean;
  duration: number; // segundos
}
```

### 3. Frontend Battle Components (20% de lo faltante)

**Componentes Faltantes:**

| Componente | Descripcion |
|------------|-------------|
| BattleArena | Contenedor principal de la batalla |
| BattleCountdown | Countdown 3-2-1-GO! |
| BattleTimer | Timer compartido |
| QuestionCard | Card de pregunta actual |
| AnswerOptions | Opciones de respuesta |
| PlayerScorePanel | Panel con score del jugador |
| OpponentScorePanel | Panel con score del oponente |
| LiveProgressBar | Barra de progreso en tiempo real |
| PowerUpBar | Barra de power-ups disponibles |
| BattleChat | Chat rapido (emojis/frases) |
| VictoryScreen | Pantalla de victoria |
| DefeatScreen | Pantalla de derrota |
| DrawScreen | Pantalla de empate |
| BattleStatsModal | Estadisticas detalladas |

**BattleArena Layout:**
```tsx
// pages/BattleArena.tsx (NUEVO)
const BattleArena: React.FC<{ challengeId: string }> = ({ challengeId }) => {
  const { battleState, sendAnswer, usePoweUp } = useBattle(challengeId);

  return (
    <BattleLayout>
      {/* Header con timer y scores */}
      <BattleHeader>
        <PlayerScorePanel player={battleState.myPlayer} />
        <BattleTimer timeRemaining={battleState.timeRemaining} />
        <OpponentScorePanel player={battleState.opponent} />
      </BattleHeader>

      {/* Area de pregunta */}
      <QuestionArea>
        {battleState.status === 'countdown' && (
          <BattleCountdown onComplete={handleCountdownComplete} />
        )}
        {battleState.status === 'active' && (
          <>
            <QuestionCard question={battleState.currentQuestion} />
            <AnswerOptions
              options={battleState.currentQuestion?.options}
              onSelect={sendAnswer}
            />
          </>
        )}
        {battleState.status === 'finished' && (
          <BattleResultScreen result={battleState.result} />
        )}
      </QuestionArea>

      {/* Footer con power-ups */}
      <PowerUpBar
        powerUps={battleState.availablePowerUps}
        onUse={usePowerUp}
      />
    </BattleLayout>
  );
};
```

### 4. useBattle Hook (5% de lo faltante)

```typescript
// hooks/useBattle.ts (NUEVO)
interface UseBattleReturn {
  battleState: BattleState;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  sendAnswer: (questionId: string, answer: string) => Promise<AnswerResult>;
  usePowerUp: (powerUpId: string) => Promise<void>;
  setReady: () => Promise<void>;
  leave: () => void;
}

export function useBattle(challengeId: string): UseBattleReturn {
  const { user } = useAuth();
  const socket = useSocket('/battle');
  const [battleState, setBattleState] = useState<BattleState | null>(null);

  useEffect(() => {
    // Join battle room
    socket.emit('battle:join', { challengeId });

    // Listen for events
    socket.on('battle:state', setBattleState);
    socket.on('battle:scoreUpdate', handleScoreUpdate);
    socket.on('battle:questionNext', handleNextQuestion);
    socket.on('battle:end', handleBattleEnd);

    return () => {
      socket.off('battle:state');
      socket.off('battle:scoreUpdate');
      socket.off('battle:questionNext');
      socket.off('battle:end');
    };
  }, [challengeId]);

  const sendAnswer = async (questionId: string, answer: string) => {
    return socket.emitWithAck('battle:answer', {
      challengeId,
      questionId,
      answer,
    });
  };

  // ... mas metodos

  return { battleState, isConnected, isLoading, error, sendAnswer, usePowerUp, setReady, leave };
}
```

---

## WebSocket Events

### Client -> Server

| Evento | Payload | Descripcion |
|--------|---------|-------------|
| `battle:join` | `{ challengeId }` | Unirse a batalla |
| `battle:ready` | `{ challengeId }` | Marcar como listo |
| `battle:answer` | `{ challengeId, questionId, answer }` | Enviar respuesta |
| `battle:powerup` | `{ challengeId, powerUpId }` | Usar power-up |
| `battle:emoji` | `{ challengeId, emoji }` | Enviar emoji |

### Server -> Client

| Evento | Payload | Descripcion |
|--------|---------|-------------|
| `battle:state` | `BattleState` | Estado completo |
| `battle:countdown` | `{ count: number }` | Countdown |
| `battle:start` | `{ question }` | Batalla inicia |
| `battle:scoreUpdate` | `{ myScore, opponentScore }` | Actualizacion de score |
| `battle:questionNext` | `{ question, timeRemaining }` | Siguiente pregunta |
| `battle:opponentAnswered` | `{ correct: boolean }` | Oponente respondio |
| `battle:powerupUsed` | `{ userId, powerUpId, effect }` | Power-up usado |
| `battle:end` | `BattleResult` | Batalla termino |
| `battle:opponentDisconnected` | `{ waitingTime }` | Oponente desconectado |

---

## Redis Data Structures

```redis
## Estado de batalla
HSET battle:{challengeId}:state
  status "active"
  startedAt "2026-01-27T10:00:00Z"
  endsAt "2026-01-27T10:05:00Z"
  exerciseId "ex-123"

## Estado de jugador 1
HSET battle:{challengeId}:player:{playerId1}
  score 350
  correctAnswers 7
  totalAnswers 10
  currentQuestionIndex 10
  isConnected true
  isReady true

## Estado de jugador 2
HSET battle:{challengeId}:player:{playerId2}
  score 280
  correctAnswers 5
  totalAnswers 9
  currentQuestionIndex 9
  isConnected true
  isReady true

## TTL: 1 hora despues de finalizar
EXPIRE battle:{challengeId}:* 3600
```

---

## Criterios de Aceptacion

### Funcionales
- [ ] Ambos jugadores ven countdown sincronizado
- [ ] Respuestas se procesan en < 200ms
- [ ] Score se actualiza en tiempo real para ambos
- [ ] Timer sincronizado (max desviacion: 1 segundo)
- [ ] Desconexion da 60 segundos para reconectar
- [ ] Pantalla de resultado muestra estadisticas detalladas
- [ ] XP y coins se otorgan al finalizar

### No Funcionales
- [ ] Latencia WebSocket < 100ms
- [ ] Sincronizacion de estado < 500ms
- [ ] Soporta 500 batallas concurrentes
- [ ] Reconexion automatica

### Seguridad
- [ ] Validacion de respuestas en servidor
- [ ] No se puede responder pregunta ya respondida
- [ ] Timeout automatico por inactividad (2 min)
- [ ] Anti-cheat basico (tiempo minimo por respuesta)

---

## Dependencias

### Bloqueado Por
- ET-PEER-001: Matchmaking (PARCIAL)
- WebSocket Infrastructure (EXISTENTE)
- Exercise Execution Service (EXISTENTE)
- Redis (EXISTENTE)

### Bloquea
- Tournament System
- Spectator Mode
- Replay System

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| BattleGateway | 10h |
| BattleSessionService | 12h |
| Frontend Components | 16h |
| useBattle Hook | 4h |
| Tests | 6h |
| **Total** | **48h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-PEER-002-realtime-battles.md*
*Generado: 2026-01-27*
