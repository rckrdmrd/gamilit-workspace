# Frontend Integration Guide - Grant Bonus ML Coins

## Para el Frontend Developer

Este documento explica cómo integrar el nuevo endpoint de Grant Bonus ML Coins en el frontend.

---

## 1. API Endpoint

### URL
```
POST /api/v1/teacher/students/:studentId/bonus
```

### Request
```typescript
interface GrantBonusRequest {
  amount: number;     // 1-1000
  reason: string;     // min 10 caracteres
}
```

### Response
```typescript
interface GrantBonusResponse {
  success: boolean;
  newBalance: number;
  message: string;
  amountGranted: number;
  reason: string;
}
```

---

## 2. API Client Implementation

### Ubicación sugerida
```
apps/frontend/src/services/api/teacher/bonusCoinsApi.ts
```

### Implementación

```typescript
// apps/frontend/src/services/api/teacher/bonusCoinsApi.ts

import { apiClient } from '../apiClient';
import { API_ROUTES } from '@/shared/constants';

export interface GrantBonusRequest {
  amount: number;
  reason: string;
}

export interface GrantBonusResponse {
  success: boolean;
  newBalance: number;
  message: string;
  amountGranted: number;
  reason: string;
}

/**
 * Otorga bonus de ML Coins a un estudiante
 * @param studentId - ID del estudiante
 * @param request - Datos del bonus (amount, reason)
 */
export async function grantBonusToStudent(
  studentId: string,
  request: GrantBonusRequest
): Promise<GrantBonusResponse> {
  const response = await apiClient.post<GrantBonusResponse>(
    `/teacher/students/${studentId}/bonus`,
    request
  );
  return response.data;
}
```

### Agregar al barrel export

```typescript
// apps/frontend/src/services/api/teacher/index.ts

export * from './bonusCoinsApi';
```

---

## 3. React Hook

### Ubicación sugerida
```
apps/frontend/src/apps/teacher/hooks/useGrantBonus.ts
```

### Implementación

```typescript
// apps/frontend/src/apps/teacher/hooks/useGrantBonus.ts

import { useState } from 'react';
import { grantBonusToStudent, GrantBonusRequest } from '@/services/api/teacher';
import { useToast } from '@/shared/hooks/useToast';

interface UseGrantBonusReturn {
  grantBonus: (studentId: string, request: GrantBonusRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useGrantBonus(): UseGrantBonusReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const grantBonus = async (studentId: string, request: GrantBonusRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await grantBonusToStudent(studentId, request);

      setSuccess(true);
      showToast({
        type: 'success',
        message: `${response.amountGranted} ML Coins otorgados exitosamente`,
        description: `Nuevo balance: ${response.newBalance} ML Coins`,
      });

      // Opcional: Refrescar datos del estudiante aquí
      // queryClient.invalidateQueries(['student', studentId]);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al otorgar bonus';
      setError(errorMessage);

      showToast({
        type: 'error',
        message: 'Error al otorgar bonus',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    grantBonus,
    isLoading,
    error,
    success,
  };
}
```

### Export en barrel

```typescript
// apps/frontend/src/apps/teacher/hooks/index.ts

export { useGrantBonus } from './useGrantBonus';
```

---

## 4. Componente Modal

### Ubicación sugerida
```
apps/frontend/src/apps/teacher/components/students/GrantBonusModal.tsx
```

### Implementación Básica

```typescript
// apps/frontend/src/apps/teacher/components/students/GrantBonusModal.tsx

import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useGrantBonus } from '@/apps/teacher/hooks/useGrantBonus';

interface GrantBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

export const GrantBonusModal: React.FC<GrantBonusModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
}) => {
  const [amount, setAmount] = useState<number>(50);
  const [reason, setReason] = useState('');
  const { grantBonus, isLoading, error } = useGrantBonus();

  const handleSubmit = async () => {
    await grantBonus(studentId, { amount, reason });

    // Si fue exitoso, limpiar y cerrar
    if (!error) {
      setAmount(50);
      setReason('');
      onClose();
    }
  };

  const isReasonValid = reason.length >= 10;
  const isAmountValid = amount >= 1 && amount <= 1000;
  const isFormValid = isReasonValid && isAmountValid;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Otorgar Bonus a {studentName}
        </ModalHeader>

        <ModalBody>
          <FormControl mb={4} isInvalid={!isAmountValid && amount > 0}>
            <FormLabel>Cantidad de ML Coins</FormLabel>
            <NumberInput
              value={amount}
              onChange={(_, val) => setAmount(val)}
              min={1}
              max={1000}
            >
              <NumberInputField placeholder="Cantidad (1-1000)" />
            </NumberInput>
            {!isAmountValid && amount > 0 && (
              <FormErrorMessage>
                Debe ser entre 1 y 1000 ML Coins
              </FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!isReasonValid && reason.length > 0}>
            <FormLabel>Razón del bonus</FormLabel>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe por qué otorgas este bonus (mínimo 10 caracteres)"
              rows={4}
            />
            {!isReasonValid && reason.length > 0 && (
              <FormErrorMessage>
                La razón debe tener al menos 10 caracteres
              </FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!isFormValid}
          >
            Otorgar Bonus
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
```

---

## 5. Uso en Página de Estudiante

### Ejemplo de integración

```typescript
// apps/frontend/src/apps/teacher/pages/StudentDetailsPage.tsx

import React, { useState } from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';
import { GrantBonusModal } from '../components/students/GrantBonusModal';

export const StudentDetailsPage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const studentId = '550e8400-e29b-41d4-a716-446655440000'; // from route params
  const studentName = 'Juan Pérez'; // from student data

  return (
    <div>
      {/* ... resto del contenido ... */}

      <Button
        colorScheme="green"
        leftIcon={<Icon as={FaCoins} />}
        onClick={onOpen}
      >
        Otorgar Bonus
      </Button>

      <GrantBonusModal
        isOpen={isOpen}
        onClose={onClose}
        studentId={studentId}
        studentName={studentName}
      />
    </div>
  );
};
```

---

## 6. Validaciones en Frontend

### Validaciones a implementar

```typescript
const validateGrantBonusForm = (amount: number, reason: string) => {
  const errors: Record<string, string> = {};

  // Validar amount
  if (amount < 1) {
    errors.amount = 'El bonus debe ser al menos 1 ML Coin';
  }
  if (amount > 1000) {
    errors.amount = 'El bonus no puede exceder 1000 ML Coins';
  }

  // Validar reason
  if (reason.length < 10) {
    errors.reason = 'La razón debe tener al menos 10 caracteres';
  }

  return errors;
};
```

---

## 7. Manejo de Errores

### Códigos HTTP esperados

| Código | Significado | Acción Frontend |
|--------|-------------|-----------------|
| 201 | Success | Mostrar toast de éxito, cerrar modal, refrescar datos |
| 400 | Validación fallida | Mostrar errores en formulario |
| 403 | Sin acceso | Mostrar mensaje "No tienes acceso a este estudiante" |
| 404 | Estudiante no existe | Mostrar mensaje "Estudiante no encontrado" |

### Implementación

```typescript
try {
  await grantBonus(studentId, { amount, reason });
} catch (error: any) {
  const status = error.response?.status;

  if (status === 403) {
    showToast({
      type: 'error',
      message: 'Sin acceso',
      description: 'No tienes acceso a este estudiante',
    });
  } else if (status === 404) {
    showToast({
      type: 'error',
      message: 'Estudiante no encontrado',
    });
  } else if (status === 400) {
    // Mostrar errores de validación
    const messages = error.response?.data?.message;
    showToast({
      type: 'error',
      message: 'Datos inválidos',
      description: Array.isArray(messages) ? messages.join(', ') : messages,
    });
  }
}
```

---

## 8. Actualización de Datos

### Invalidar cache de React Query

Si usas React Query, invalida las queries relacionadas después de otorgar bonus:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Después de otorgar bonus exitosamente
queryClient.invalidateQueries(['student', studentId]);
queryClient.invalidateQueries(['studentStats', studentId]);
```

---

## 9. Testing

### Test del Hook

```typescript
// apps/frontend/src/apps/teacher/hooks/__tests__/useGrantBonus.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { useGrantBonus } from '../useGrantBonus';
import * as api from '@/services/api/teacher';

jest.mock('@/services/api/teacher');

describe('useGrantBonus', () => {
  it('should grant bonus successfully', async () => {
    const mockResponse = {
      success: true,
      newBalance: 250,
      message: 'Bonus otorgado',
      amountGranted: 50,
      reason: 'Test reason',
    };

    (api.grantBonusToStudent as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGrantBonus());

    await act(async () => {
      await result.current.grantBonus('student-id', {
        amount: 50,
        reason: 'Test reason for bonus',
      });
    });

    await waitFor(() => {
      expect(result.current.success).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

---

## 10. Constantes

### Agregar a constantes de rutas

```typescript
// apps/frontend/src/shared/constants/routes.constants.ts

export const API_ROUTES = {
  // ... otras rutas ...
  TEACHER: {
    // ... otras rutas de teacher ...
    GRANT_BONUS: (studentId: string) => `/teacher/students/${studentId}/bonus`,
  },
};
```

---

## 11. TypeScript Types

### Crear tipos compartidos

```typescript
// apps/frontend/src/types/teacher.types.ts

export interface GrantBonusRequest {
  amount: number;
  reason: string;
}

export interface GrantBonusResponse {
  success: boolean;
  newBalance: number;
  message: string;
  amountGranted: number;
  reason: string;
}
```

---

## 12. UI/UX Recomendaciones

### Componentes sugeridos

1. **Modal para otorgar bonus**
   - Input numérico para cantidad
   - Textarea para razón
   - Botón de confirmación
   - Validación en tiempo real

2. **Toast notifications**
   - Éxito: "50 ML Coins otorgados. Nuevo balance: 250"
   - Error: Mensaje descriptivo del error

3. **Confirmación visual**
   - Animación de monedas
   - Actualización inmediata del balance
   - Historial de bonus en perfil del estudiante

---

## 13. Ejemplo Completo

### Flujo completo de UI

```
1. Teacher abre perfil de estudiante
   ↓
2. Click en botón "Otorgar Bonus"
   ↓
3. Modal se abre
   - Input: cantidad (default 50)
   - Textarea: razón
   ↓
4. Teacher ingresa datos
   - Validación en tiempo real
   - Deshabilitar botón si inválido
   ↓
5. Click en "Otorgar Bonus"
   - Botón muestra loading
   - Request al backend
   ↓
6. Response exitoso
   - Modal se cierra
   - Toast de éxito
   - Balance actualizado en UI
   - Opcional: Confetti animation
```

---

## 14. Swagger Testing

Puedes probar el endpoint directamente desde Swagger:

```
http://localhost:3000/api/docs
```

1. Busca "Teacher" > "Grant bonus ML Coins to student"
2. Click en "Try it out"
3. Ingresa studentId, amount, reason
4. Ejecuta

---

## 15. Checklist de Integración Frontend

- [ ] Crear `bonusCoinsApi.ts` en services/api/teacher
- [ ] Crear hook `useGrantBonus` en apps/teacher/hooks
- [ ] Crear componente `GrantBonusModal`
- [ ] Integrar modal en página de detalles de estudiante
- [ ] Agregar validaciones de formulario
- [ ] Implementar manejo de errores
- [ ] Agregar toast notifications
- [ ] Invalidar cache de React Query
- [ ] Agregar tests unitarios
- [ ] Actualizar tipos TypeScript
- [ ] Documentar componente con Storybook (opcional)
- [ ] Agregar animaciones de éxito (opcional)

---

## 16. Recursos Adicionales

### Documentación Backend
- `IMPLEMENTATION-REPORT-GRANT-BONUS-ML-COINS-2025-11-24.md`
- `ENDPOINT-GRANT-BONUS-QUICK-REFERENCE.md`
- `GRANT-BONUS-IMPLEMENTATION-SUMMARY.md`

### Swagger
- http://localhost:3000/api/docs

### Script de Testing
```bash
./apps/backend/scripts/test-grant-bonus.sh <TOKEN> <STUDENT_ID>
```

---

**Listo para integración frontend!**

Si tienes dudas, consulta la documentación completa en:
- `apps/backend/ENDPOINT-GRANT-BONUS-QUICK-REFERENCE.md`
