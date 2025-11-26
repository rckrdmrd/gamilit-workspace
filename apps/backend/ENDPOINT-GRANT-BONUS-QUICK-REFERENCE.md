# Grant Bonus ML Coins - Quick Reference

## Endpoint

```
POST /api/v1/teacher/students/:studentId/bonus
```

## Autenticación

- **Requerida:** Sí (Bearer Token)
- **Roles permitidos:** `admin_teacher`, `super_admin`

## Request

### Path Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| studentId | UUID | Sí | ID del estudiante (profile.id) |

### Body (JSON)

```json
{
  "amount": 50,
  "reason": "Excelente participación en clase y ayuda a compañeros"
}
```

| Campo | Tipo | Validación | Descripción |
|-------|------|------------|-------------|
| amount | number | Min: 1, Max: 1000 | Cantidad de ML Coins a otorgar |
| reason | string | MinLength: 10 | Razón o motivo del bonus |

## Response

### Success (201 Created)

```json
{
  "success": true,
  "newBalance": 250,
  "message": "Bonus de 50 ML Coins otorgado exitosamente",
  "amountGranted": 50,
  "reason": "Excelente participación en clase y ayuda a compañeros"
}
```

### Error Responses

#### 400 Bad Request - Validación fallida
```json
{
  "statusCode": 400,
  "message": [
    "El bonus debe ser al menos 1 ML Coin",
    "La razón debe tener al menos 10 caracteres"
  ],
  "error": "Bad Request"
}
```

#### 403 Forbidden - Sin acceso al estudiante
```json
{
  "statusCode": 403,
  "message": "No tienes acceso a este estudiante. El estudiante debe estar en una de tus clases.",
  "error": "Forbidden"
}
```

#### 404 Not Found - Estudiante no existe
```json
{
  "statusCode": 404,
  "message": "Estudiante con ID 550e8400-e29b-41d4-a716-446655440000 no encontrado",
  "error": "Not Found"
}
```

## Ejemplos de Uso

### cURL

```bash
curl -X POST http://localhost:3000/api/v1/teacher/students/550e8400-e29b-41d4-a716-446655440000/bonus \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "reason": "Excelente participación en clase y ayuda a compañeros"
  }'
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const grantBonus = async (studentId, amount, reason) => {
  try {
    const response = await axios.post(
      `/api/v1/teacher/students/${studentId}/bonus`,
      {
        amount,
        reason
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    console.log('Bonus otorgado:', response.data);
    console.log('Nuevo balance:', response.data.newBalance);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('No tienes acceso a este estudiante');
    } else if (error.response?.status === 400) {
      console.error('Validación fallida:', error.response.data.message);
    }
    throw error;
  }
};

// Uso
await grantBonus(
  '550e8400-e29b-41d4-a716-446655440000',
  50,
  'Excelente participación en clase'
);
```

### TypeScript (Fetch)

```typescript
interface GrantBonusRequest {
  amount: number;
  reason: string;
}

interface GrantBonusResponse {
  success: boolean;
  newBalance: number;
  message: string;
  amountGranted: number;
  reason: string;
}

async function grantBonus(
  studentId: string,
  request: GrantBonusRequest
): Promise<GrantBonusResponse> {
  const response = await fetch(
    `/api/v1/teacher/students/${studentId}/bonus`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// Uso
const result = await grantBonus('550e8400-e29b-41d4-a716-446655440000', {
  amount: 50,
  reason: 'Excelente participación en clase y ayuda a compañeros',
});

console.log(`Nuevo balance: ${result.newBalance} ML Coins`);
```

## Validaciones

### Amount

- **Mínimo:** 1 ML Coin
- **Máximo:** 1000 ML Coins
- **Tipo:** Número entero positivo

### Reason

- **Mínimo:** 10 caracteres
- **Tipo:** String
- **Ejemplos válidos:**
  - "Excelente participación en clase"
  - "Ayudó a compañeros con ejercicios difíciles"
  - "Presentación sobresaliente del proyecto"
- **Ejemplos inválidos:**
  - "Bien" (muy corto)
  - "Genial" (muy corto)

## Seguridad

### Validaciones de Acceso

El endpoint valida automáticamente que:

1. El teacher está autenticado (JWT válido)
2. El teacher tiene rol `admin_teacher` o `super_admin`
3. El estudiante existe en la base de datos
4. El estudiante está en al menos una clase del teacher

Si alguna validación falla, se retorna el código HTTP apropiado (403 o 404).

### Límites

- **Por transacción:** 1-1000 ML Coins
- **Sin límite diario** (por ahora)
- **Sin límite de veces** que un teacher puede dar bonus al mismo estudiante

## Base de Datos

### Tabla Afectada: `gamification_system.user_stats`

```sql
-- Campos actualizados
ml_coins = ml_coins + amount
ml_coins_earned_total = ml_coins_earned_total + amount

-- Historial registrado en metadata.bonus_history
metadata = metadata || {
  "bonus_history": [
    {
      "teacher_id": "...",
      "amount": 50,
      "reason": "...",
      "granted_at": "2025-11-24T10:30:00.000Z",
      "previous_balance": 200,
      "new_balance": 250
    }
  ]
}
```

## Testing

### Script de Testing

```bash
# Ejecutar tests automáticos
./apps/backend/scripts/test-grant-bonus.sh <TEACHER_TOKEN> <STUDENT_ID>
```

### Tests Incluidos

1. Bonus válido (50 ML Coins) → Espera HTTP 201
2. Amount inválido (0) → Espera HTTP 400
3. Amount inválido (1001) → Espera HTTP 400
4. Reason inválido (corto) → Espera HTTP 400

## Casos de Uso

### 1. Recompensa por Participación

```json
{
  "amount": 50,
  "reason": "Excelente participación en clase durante toda la semana"
}
```

### 2. Reconocimiento por Ayuda

```json
{
  "amount": 30,
  "reason": "Ayudó a varios compañeros a entender conceptos difíciles"
}
```

### 3. Premio por Proyecto

```json
{
  "amount": 100,
  "reason": "Proyecto final excepcional con presentación sobresaliente"
}
```

### 4. Bonus por Mejora

```json
{
  "amount": 75,
  "reason": "Mejora significativa en rendimiento y actitud en las últimas semanas"
}
```

## Swagger UI

Accede a la documentación interactiva en:

```
http://localhost:3000/api/docs
```

Busca el endpoint en la sección **Teacher** > **Grant bonus ML Coins to student**

## Troubleshooting

### Error: "No tienes acceso a este estudiante"

**Causa:** El estudiante no está en ninguna de las clases del teacher.

**Solución:** Verifica que:
1. El studentId es correcto
2. El estudiante está asignado a una clase
3. El teacher está asignado a esa misma clase

### Error: "El bonus debe ser al menos 1 ML Coin"

**Causa:** El campo `amount` es 0 o negativo.

**Solución:** Usa un valor entre 1 y 1000.

### Error: "La razón debe tener al menos 10 caracteres"

**Causa:** El campo `reason` es muy corto.

**Solución:** Proporciona una razón descriptiva de al menos 10 caracteres.

## Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-11-24 | Implementación inicial |

## Referencias

- Controller: `apps/backend/src/modules/teacher/controllers/teacher.controller.ts`
- Service: `apps/backend/src/modules/teacher/services/bonus-coins.service.ts`
- DTO: `apps/backend/src/modules/teacher/dto/grant-bonus.dto.ts`
- Test Script: `apps/backend/scripts/test-grant-bonus.sh`
