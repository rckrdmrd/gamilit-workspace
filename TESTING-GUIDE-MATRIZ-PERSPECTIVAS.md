# Guía de Testing - MatrizPerspectivasExercise Backend Integration

**Fecha:** 2025-11-24
**Componente:** `apps/frontend/src/features/mechanics/module3/MatrizPerspectivas/MatrizPerspectivasExercise.tsx`

---

## 1. TESTING MANUAL - CHECKLIST RÁPIDA

### Prerrequisitos
- [ ] Backend ejecutándose en `http://localhost:3006`
- [ ] Usuario autenticado en el frontend
- [ ] Ejercicio "matriz-perspectivas-1" existe en BD

### Casos de Prueba Básicos

#### ✅ TC-01: Generar Perspectivas
```
1. Navegar al ejercicio Matriz de Perspectivas
2. Click en "Generar Perspectivas con IA"
3. VERIFICAR: Se muestran 6 perspectivas
4. VERIFICAR: Aparece sección "Preguntas de Análisis"
```

#### ✅ TC-02: Validación de Respuestas Vacías
```
1. Generar perspectivas
2. NO escribir en ninguna pregunta
3. Click en "Completar Ejercicio"
4. VERIFICAR: Botón está deshabilitado (gris)
```

#### ✅ TC-03: Validación de Respuestas Cortas
```
1. Generar perspectivas
2. Escribir "Hola" (5 caracteres) en q1
3. VERIFICAR: Texto rojo "Faltan 45 caracteres"
4. Escribir hasta 50 caracteres
5. VERIFICAR: Texto verde "✓ Completo"
```

#### ✅ TC-04: Envío Exitoso
```
1. Generar perspectivas
2. Escribir respuestas válidas en las 3 preguntas (>= 50 caracteres)
3. Click en "Completar Ejercicio"
4. VERIFICAR: Botón muestra "Enviando..."
5. VERIFICAR: Aparece modal con score
6. VERIFICAR: Score es 0-100
7. VERIFICAR: Mensaje de feedback
```

#### ✅ TC-05: Reiniciar Ejercicio
```
1. Completar ejercicio exitosamente
2. Click en "Reiniciar"
3. VERIFICAR: Perspectivas se limpian
4. VERIFICAR: Respuestas se limpian
5. VERIFICAR: Score se resetea a 0
```

#### ✅ TC-06: Error de Autenticación
```
1. Cerrar sesión
2. Intentar completar ejercicio
3. VERIFICAR: Modal de error "Debes estar autenticado"
```

---

## 2. TESTING CON CURL

### Verificar que el endpoint existe

```bash
# Test 1: Enviar respuestas válidas
curl -X POST http://localhost:3006/api/progress/submissions/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "exerciseId": "matriz-perspectivas-1",
    "userId": "user-123",
    "answers": {
      "questions": {
        "q1": "La perspectiva de la prensa francesa fue la más injusta con Marie Curie porque la juzgaron moralmente en lugar de científicamente, enfocándose en su vida personal.",
        "q2": "La percepción de Marie Curie ha evolucionado de ser vista como una intrusa extranjera a ser reconocida como una pionera científica y símbolo de perseverancia.",
        "q3": "Los historiadores modernos tuvieron la perspectiva más equilibrada porque analizan el contexto histórico sin los sesgos de la época y valoran sus contribuciones científicas."
      }
    }
  }'

# Respuesta esperada:
# {
#   "success": true,
#   "data": {
#     "attemptId": "...",
#     "score": 85,
#     "isPerfect": false,
#     "correctAnswersCount": 2,
#     "totalQuestions": 3,
#     "rewards": { "mlCoins": 20, "xp": 100, ... },
#     "feedback": { "overall": "Buen análisis!", ... }
#   }
# }
```

```bash
# Test 2: Enviar respuestas incompletas (backend debería rechazar)
curl -X POST http://localhost:3006/api/progress/submissions/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "exerciseId": "matriz-perspectivas-1",
    "userId": "user-123",
    "answers": {
      "questions": {
        "q1": "Corta",
        "q2": "Muy corta",
        "q3": "X"
      }
    }
  }'

# Respuesta esperada:
# {
#   "success": false,
#   "error": "Validation failed: questions must have minimum 50 characters"
# }
```

---

## 3. TESTING AUTOMATIZADO

### Test Unitario (Jest + React Testing Library)

Crear archivo: `apps/frontend/src/features/mechanics/module3/MatrizPerspectivas/__tests__/MatrizPerspectivasExercise.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatrizPerspectivasExercise } from '../MatrizPerspectivasExercise';
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Mocks
jest.mock('@/features/progress/api/progressAPI');
jest.mock('@/features/auth/hooks/useAuth');

describe('MatrizPerspectivasExercise - Backend Integration', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-123', username: 'testuser' },
      isAuthenticated: true
    });
  });

  it('should show analysis questions after generating perspectives', async () => {
    render(<MatrizPerspectivasExercise exerciseId="test-1" />);

    const generateButton = screen.getByText(/Generar Perspectivas/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Preguntas de Análisis/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button when answers are incomplete', async () => {
    render(<MatrizPerspectivasExercise exerciseId="test-1" />);

    // Generar perspectivas
    fireEvent.click(screen.getByText(/Generar Perspectivas/i));

    await waitFor(() => {
      const submitButton = screen.getByText(/Completar Ejercicio/i);
      expect(submitButton).toBeDisabled();
    });
  });

  it('should enable submit button when all answers are valid', async () => {
    render(<MatrizPerspectivasExercise exerciseId="test-1" />);

    // Generar perspectivas
    fireEvent.click(screen.getByText(/Generar Perspectivas/i));

    await waitFor(() => {
      const textareas = screen.getAllByRole('textbox');

      // Escribir 50+ caracteres en cada textarea
      userEvent.type(textareas[0], 'A'.repeat(50));
      userEvent.type(textareas[1], 'B'.repeat(50));
      userEvent.type(textareas[2], 'C'.repeat(50));

      const submitButton = screen.getByText(/Completar Ejercicio/i);
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should call submitExercise with correct format', async () => {
    const mockSubmit = submitExercise as jest.Mock;
    mockSubmit.mockResolvedValue({
      score: 90,
      isPerfect: false,
      feedback: { overall: 'Great!' }
    });

    render(<MatrizPerspectivasExercise exerciseId="test-1" />);

    // Generar perspectivas y completar
    fireEvent.click(screen.getByText(/Generar Perspectivas/i));

    await waitFor(() => {
      const textareas = screen.getAllByRole('textbox');
      userEvent.type(textareas[0], 'A'.repeat(50));
      userEvent.type(textareas[1], 'B'.repeat(50));
      userEvent.type(textareas[2], 'C'.repeat(50));

      fireEvent.click(screen.getByText(/Completar Ejercicio/i));

      expect(mockSubmit).toHaveBeenCalledWith(
        'test-1',
        'user-123',
        expect.objectContaining({
          questions: expect.objectContaining({
            q1: expect.any(String),
            q2: expect.any(String),
            q3: expect.any(String)
          })
        })
      );
    });
  });

  it('should show feedback modal on successful submission', async () => {
    const mockSubmit = submitExercise as jest.Mock;
    mockSubmit.mockResolvedValue({
      score: 100,
      isPerfect: true,
      feedback: { overall: 'Perfect!' }
    });

    render(<MatrizPerspectivasExercise exerciseId="test-1" />);

    // Completar y enviar
    fireEvent.click(screen.getByText(/Generar Perspectivas/i));

    await waitFor(async () => {
      const textareas = screen.getAllByRole('textbox');
      userEvent.type(textareas[0], 'A'.repeat(50));
      userEvent.type(textareas[1], 'B'.repeat(50));
      userEvent.type(textareas[2], 'C'.repeat(50));

      fireEvent.click(screen.getByText(/Completar Ejercicio/i));

      // Verificar modal
      await waitFor(() => {
        expect(screen.getByText(/Perfect!/i)).toBeInTheDocument();
      });
    });
  });

  it('should show error modal when submission fails', async () => {
    const mockSubmit = submitExercise as jest.Mock;
    mockSubmit.mockRejectedValue(new Error('Network error'));

    render(<MatrizPerspectivasExercise exerciseId="test-1" />);

    // Completar y enviar
    fireEvent.click(screen.getByText(/Generar Perspectivas/i));

    await waitFor(async () => {
      const textareas = screen.getAllByRole('textbox');
      userEvent.type(textareas[0], 'A'.repeat(50));
      userEvent.type(textareas[1], 'B'.repeat(50));
      userEvent.type(textareas[2], 'C'.repeat(50));

      fireEvent.click(screen.getByText(/Completar Ejercicio/i));

      // Verificar modal de error
      await waitFor(() => {
        expect(screen.getByText(/Error al Enviar/i)).toBeInTheDocument();
      });
    });
  });

  it('should reset answers when reset button is clicked', async () => {
    render(<MatrizPerspectivasExercise exerciseId="test-1" />);

    // Generar perspectivas
    fireEvent.click(screen.getByText(/Generar Perspectivas/i));

    await waitFor(() => {
      const textareas = screen.getAllByRole('textbox');
      userEvent.type(textareas[0], 'Test answer');

      // Click reset
      fireEvent.click(screen.getByText(/Reiniciar/i));

      // Verificar que se limpió
      expect(textareas[0]).toHaveValue('');
    });
  });
});
```

### Ejecutar Tests

```bash
cd apps/frontend
npm test MatrizPerspectivasExercise.test.tsx
```

---

## 4. TESTING DE INTEGRACIÓN E2E

### Cypress Test

Crear: `apps/frontend/cypress/e2e/matriz-perspectivas.cy.ts`

```typescript
describe('MatrizPerspectivas - E2E Integration Test', () => {
  beforeEach(() => {
    // Login
    cy.visit('/login');
    cy.get('[data-testid="username"]').type('testuser');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-btn"]').click();

    // Navegar al ejercicio
    cy.visit('/exercises/matriz-perspectivas-1');
  });

  it('should complete full exercise flow', () => {
    // 1. Generar perspectivas
    cy.contains('Generar Perspectivas con IA').click();

    // 2. Esperar a que carguen las perspectivas
    cy.contains('Prensa Francesa', { timeout: 10000 }).should('be.visible');

    // 3. Verificar sección de preguntas
    cy.contains('Preguntas de Análisis').should('be.visible');

    // 4. Llenar las 3 preguntas
    cy.get('textarea').eq(0).type('A'.repeat(60));
    cy.get('textarea').eq(1).type('B'.repeat(60));
    cy.get('textarea').eq(2).type('C'.repeat(60));

    // 5. Verificar que el botón se habilitó
    cy.contains('Completar Ejercicio').should('not.be.disabled');

    // 6. Enviar
    cy.contains('Completar Ejercicio').click();

    // 7. Verificar modal de feedback
    cy.contains(/Análisis Completo|Buen Análisis/i, { timeout: 5000 })
      .should('be.visible');

    // 8. Verificar que muestra score
    cy.contains(/\d+/).should('be.visible'); // Número de score
  });

  it('should show validation error for incomplete answers', () => {
    cy.contains('Generar Perspectivas con IA').click();

    cy.contains('Prensa Francesa', { timeout: 10000 }).should('be.visible');

    // Escribir solo 10 caracteres
    cy.get('textarea').eq(0).type('Short');

    // Verificar mensaje de validación
    cy.contains(/Faltan \d+ caracteres/i).should('be.visible');

    // Verificar que botón sigue deshabilitado
    cy.contains('Completar Ejercicio').should('be.disabled');
  });

  it('should reset exercise correctly', () => {
    cy.contains('Generar Perspectivas con IA').click();

    cy.contains('Prensa Francesa', { timeout: 10000 }).should('be.visible');

    // Escribir respuestas
    cy.get('textarea').eq(0).type('A'.repeat(60));

    // Click reset
    cy.contains('Reiniciar').click();

    // Verificar que se limpió
    cy.get('textarea').eq(0).should('have.value', '');
    cy.contains('Prensa Francesa').should('not.exist');
  });
});
```

### Ejecutar E2E Tests

```bash
cd apps/frontend
npx cypress run --spec cypress/e2e/matriz-perspectivas.cy.ts
```

---

## 5. DEBUGGING TIPS

### Network Errors

Si recibes error de red:

```javascript
// Ver en DevTools → Network
// Buscar: /api/progress/submissions/submit

// Request payload debe ser:
{
  "exerciseId": "matriz-perspectivas-1",
  "userId": "...",
  "answers": {
    "questions": {
      "q1": "...",
      "q2": "...",
      "q3": "..."
    }
  }
}
```

### Console Logs

Agregar temporalmente en `MatrizPerspectivasExercise.tsx`:

```typescript
const handleComplete = async () => {
  console.log('[DEBUG] Answers:', answers);
  console.log('[DEBUG] User:', user);
  console.log('[DEBUG] Exercise ID:', exercise?.id || exerciseId);

  // ... resto del código

  try {
    console.log('[DEBUG] Sending to backend...');
    const response = await submitExercise(...);
    console.log('[DEBUG] Backend response:', response);
  } catch (error) {
    console.error('[DEBUG] Error:', error);
  }
};
```

### Verificar Autenticación

```javascript
// En DevTools Console
console.log(localStorage.getItem('authToken'));

// O desde el componente
const { user } = useAuth();
console.log('User:', user);
```

---

## 6. CHECKLIST DE VALIDACIÓN FINAL

### Frontend
- [ ] Componente compila sin errores TypeScript
- [ ] Build exitoso: `npm run build`
- [ ] No hay warnings de ESLint
- [ ] Imports correctos de submitExercise y useAuth
- [ ] Estado de answers inicializado correctamente
- [ ] Validación de 50 caracteres funciona
- [ ] Botón se deshabilita/habilita correctamente
- [ ] Loading state durante envío
- [ ] Feedback modal muestra score correcto
- [ ] onComplete() se llama después de éxito

### Backend (verificar con Backend-Agent)
- [ ] Endpoint `/api/progress/submissions/submit` existe
- [ ] Acepta DTO con `{ questions: Record<string, string> }`
- [ ] Valida longitud mínima de respuestas
- [ ] Retorna `SubmitExerciseResponse` correctamente
- [ ] Guarda attempt en BD
- [ ] Actualiza stats del usuario
- [ ] Calcula score correctamente

### Base de Datos
- [ ] Tabla `exercise_attempts` existe
- [ ] Ejercicio "matriz-perspectivas-1" existe en `exercises`
- [ ] Columna `answers` tipo JSONB
- [ ] Índices apropiados

---

## 7. TROUBLESHOOTING COMÚN

| Error | Causa | Solución |
|-------|-------|----------|
| "User not authenticated" | No hay token JWT | Login nuevamente |
| "Exercise not found" | ID incorrecto | Verificar BD: `SELECT id FROM exercises WHERE id = 'matriz-perspectivas-1'` |
| "Network Error" | Backend no corriendo | Iniciar backend: `npm run dev` |
| "Validation failed" | Respuestas < 50 chars | Revisar validación frontend |
| "CORS error" | Origen no permitido | Verificar CORS en backend |
| Modal no aparece | feedback es null | Verificar que setFeedback() se llama correctamente |
| Score no se muestra | response.score undefined | Verificar respuesta del backend |

---

**Última actualización:** 2025-11-24
**Versión:** 1.0
