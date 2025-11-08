# Trazabilidad: Economy & ML Coins Transactions

**Metadata RFC-0001**
- **Tipo:** Especificacion Tecnica - Trazabilidad Modular
- **Categoria:** Economy, Gamification, ML Coins
- **Version:** 2.0
- **Fecha:** Octubre 2025
- **Stack:** PostgreSQL 16 → Node.js/TypeScript → React/TypeScript
- **Autor:** Sistema GAMILIT
- **Estado:** Activo

---

## Vision General

Este modulo documenta la trazabilidad completa del sistema de economia virtual (ML Coins) en la plataforma GAMILIT, incluyendo transacciones, balance management y multiplicadores de rango.

**Alcance:** ML Coins Transactions, Wallet Management, Rank Multipliers

---

## Flujo 3: Transaccion de ML Coins

**Trigger:** Usuario gana monedas por completar ejercicio

### Frontend - Economy Store
```typescript
// features/gamification/economy/store/economyStore.ts
addCoins: (amount, source, description) => {
  const state = get();
  const newBalance = state.balance.current + amount;

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'earn',
    amount,
    source,
    description: description || `Earned ${amount} ML from ${source}`,
    timestamp: new Date(),
    balanceAfter: newBalance,
  };

  set({
    balance: {
      ...state.balance,
      current: newBalance,
      lifetime: state.balance.lifetime + amount,
    },
    transactions: [transaction, ...state.transactions],
  });

  // Mostrar notificacion
  toast.success(`+${amount} ML Coins!`, {
    icon: '💰',
  });
}
```

### Backend - Gamification Service
```typescript
// backend/modules/gamification/gamification.service.ts
async addMLCoins(dto: AddCoinsDto, dbClient?: PoolClient) {
  const client = dbClient || await pool.connect();

  try {
    if (!dbClient) await client.query('BEGIN');

    // 1. Obtener balance actual
    const stats = await gamificationRepository.getUserStats(dto.userId, client);
    const currentBalance = stats.ml_coins;

    // 2. Calcular multiplicador de rango
    const multiplier = await this.getRankMultiplier(dto.userId, client);
    const finalAmount = Math.floor(dto.amount * multiplier);

    // 3. Actualizar balance
    const newBalance = currentBalance + finalAmount;

    await client.query(
      `UPDATE gamification_system.user_stats
       SET
         ml_coins = $2,
         ml_coins_earned_total = ml_coins_earned_total + $3,
         updated_at = NOW()
       WHERE user_id = $1`,
      [dto.userId, newBalance, finalAmount]
    );

    // 4. Crear transaccion
    await client.query(
      `INSERT INTO gamification_system.ml_coins_transactions (
         id, user_id, amount, transaction_type, reason,
         reference_id, balance_before, balance_after,
         multiplier, created_at
       ) VALUES (
         gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW()
       )`,
      [
        dto.userId,
        finalAmount,
        dto.transactionType,
        dto.reason,
        dto.referenceId,
        currentBalance,
        newBalance,
        multiplier
      ]
    );

    if (!dbClient) await client.query('COMMIT');

    return {
      newBalance,
      transaction: {
        amount: finalAmount,
        reason: dto.reason,
        balanceAfter: newBalance
      }
    };

  } catch (error) {
    if (!dbClient) await client.query('ROLLBACK');
    throw error;
  } finally {
    if (!dbClient) client.release();
  }
}
```

### Database Tables
```sql
-- gamification_system.user_stats
UPDATE gamification_system.user_stats
SET
  ml_coins = ml_coins + 100,                    -- Nuevo balance
  ml_coins_earned_total = ml_coins_earned_total + 100,  -- Total ganado
  updated_at = gamilit.now_mexico()
WHERE user_id = 'user-uuid';

-- gamification_system.ml_coins_transactions (Ledger)
INSERT INTO gamification_system.ml_coins_transactions (
  id,                  -- UUID
  user_id,             -- UUID FK -> profiles(id)
  amount,              -- INTEGER (+100)
  transaction_type,    -- transaction_type ENUM ('earned_exercise')
  reason,              -- TEXT ('Completed: Crucigrama Cientifico')
  reference_id,        -- UUID (exercise_id)
  balance_before,      -- INTEGER (500)
  balance_after,       -- INTEGER (600)
  multiplier,          -- NUMERIC (1.25 por rango Nacom)
  created_at           -- TIMESTAMPTZ
) VALUES (
  gen_random_uuid(), 'user-uuid', 100, 'earned_exercise',
  'Completed: Crucigrama Cientifico', 'exercise-uuid',
  500, 600, 1.25, NOW()
);
```

### Wallet UI Component
```typescript
// features/gamification/economy/components/WalletWidget.tsx
const WalletWidget = () => {
  const balance = useEconomyStore((state) => state.balance);
  const transactions = useEconomyStore((state) => state.transactions);

  return (
    <div className="wallet-widget">
      <div className="balance">
        <span className="amount">{balance.current}</span>
        <span className="label">ML Coins</span>
      </div>

      <div className="stats">
        <div>Ganado Total: {balance.lifetime}</div>
        <div>Gastado Total: {balance.spent}</div>
      </div>

      <div className="recent-transactions">
        {transactions.slice(0, 5).map(tx => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </div>
  );
};
```

---

## Tipos de Datos

### Frontend Types
```typescript
interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  source: string;
  description: string;
  timestamp: Date;
  balanceAfter: number;
}

interface EconomyBalance {
  current: number;
  lifetime: number;
  spent: number;
}
```

### Backend Types
```typescript
interface AddCoinsDto {
  userId: string;
  amount: number;
  transactionType: TransactionType;
  reason: string;
  referenceId?: string;
}

interface MLCoinsTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  reason: string;
  reference_id?: string;
  balance_before: number;
  balance_after: number;
  multiplier: number;
  created_at: Date;
}
```

---

## Diagrama de Flujo

```
Exercise Completion
        ↓
  Economy Store (Frontend)
        ↓
    addCoins()
        ↓
Backend Gamification Service
        ↓
┌───────┴────────┐
↓                ↓
Get Current     Calculate
  Balance      Multiplier
     ↓              ↓
Update user_stats   ↓
     ↓              ↓
Create Transaction  ↓
     ↓              ↓
    Commit ← ← ← ← ←
        ↓
  Return Results
        ↓
  Update UI Wallet
```

---

## Patrones de Diseno

### Transaccional Integrity
- Uso de transacciones DB para garantizar consistency
- Ledger pattern: todas las transacciones se registran
- Balance calculation: balance_after = balance_before + amount

### Rank Multipliers
- Los rangos Maya aplican multiplicadores a las ganancias
- Multiplicador se calcula en backend
- Se registra en cada transaccion para auditoria

---

## Referencias

- **Documento Padre:** TRAZABILIDAD-COMPLETA.md
- **Relacionado con:** 02-educational-mechanics.md, 04-gamification-progression.md
- **RFC-0001:** Governance Model GAMILIT Platform
