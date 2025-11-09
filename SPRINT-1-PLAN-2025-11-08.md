# SPRINT 1 - TESTING INTENSIVO Y ACTIVACIÓN DE INTEGRACIONES

**Fecha inicio:** 2025-11-08
**Duración:** 2 semanas (10 días laborales)
**Objetivo:** Incrementar coverage de tests y activar integraciones críticas
**Estado:** 🚀 EN PROGRESO

---

## 🎯 OBJETIVOS DEL SPRINT

### Objetivo Principal
Incrementar la cobertura de testing del proyecto del **15% actual al 28%** y activar las integraciones externas preparadas.

### Objetivos Específicos

**Testing:**
1. ✅ Backend: 18% → 30% (+12 puntos)
2. ✅ Frontend: 13% → 25% (+12 puntos)
3. ✅ Crear al menos 40 archivos de test nuevos

**Integraciones:**
4. ✅ Activar SendGrid para email notifications
5. ✅ Activar Firebase FCM para push notifications
6. ✅ Documentar configuración de integraciones

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica | Inicio | Meta | Gap |
|---------|--------|------|-----|
| **Backend Coverage** | 18% | 30% | +12% |
| **Frontend Coverage** | 13% | 25% | +12% |
| **Backend Test Files** | 2 | 25+ | +23 |
| **Frontend Test Files** | 8 | 30+ | +22 |
| **Integraciones Activas** | 0 | 2 | +2 |

---

## 📅 CRONOGRAMA

### Semana 1 (Días 1-5)

#### Día 1: Setup y Tests Backend Auth
- ✅ Setup de entorno de testing
- ✅ Tests para auth.service.ts (crítico)
- ✅ Tests para jwt.service.ts
- Meta: +8% coverage backend

#### Día 2: Tests Backend Admin y Progress
- Tests para admin.service.ts
- Tests para user-management.service.ts
- Tests para progress.service.ts
- Meta: +6% coverage backend

#### Día 3: Tests Frontend Auth
- Tests para authStore (ampliar existente)
- Tests para LoginForm component
- Tests para RegisterForm component
- Meta: +6% coverage frontend

#### Día 4: Tests Frontend Stores
- Tests para economyStore
- Tests para ranksStore
- Tests para achievementsStore
- Meta: +6% coverage frontend

#### Día 5: Configuración SendGrid
- Configurar cuenta SendGrid
- Implementar templates de email
- Tests de integración SendGrid
- Documentación

### Semana 2 (Días 6-10)

#### Día 6: Tests Backend Educational y Gamification
- Tests para educational.service.ts
- Tests para module.service.ts
- Ampliar tests de gamification
- Meta: +4% coverage backend

#### Día 7: Tests Frontend Components
- Tests para componentes compartidos
- Tests para componentes de student portal
- Meta: +4% coverage frontend

#### Día 8: Tests Frontend APIs
- Tests para educationalAPI.ts
- Tests para missionsAPI.ts
- Tests para notificationsAPI.ts
- Meta: +4% coverage frontend

#### Día 9: Configuración Firebase FCM
- Configurar proyecto Firebase
- Implementar FCM en backend
- Implementar FCM en frontend
- Tests de push notifications
- Documentación

#### Día 10: Validación y Reporte
- Ejecutar suite completa de tests
- Verificar coverage alcanzado
- Validar integraciones
- Generar reporte de Sprint 1

---

## 🎯 TAREAS DETALLADAS

### BACKEND TESTING (15 archivos nuevos)

#### Prioridad CRÍTICA (Días 1-2)

**1. Auth Module (6 archivos)**
```
apps/backend/src/modules/auth/__tests__/
├── auth.service.spec.ts          (NUEVO)
├── jwt.service.spec.ts           (NUEVO)
├── rbac.service.spec.ts          (NUEVO)
├── session.service.spec.ts       (NUEVO)
├── auth.controller.spec.ts       (NUEVO)
└── integration/
    └── auth-flow.spec.ts         (NUEVO)
```

**Cobertura esperada:**
- auth.service.ts: 80%
- jwt.service.ts: 90%
- rbac.service.ts: 75%
- session.service.ts: 70%
- auth.controller.ts: 80%

**2. Admin Module (4 archivos)**
```
apps/backend/src/modules/admin/__tests__/
├── admin.service.spec.ts              (NUEVO)
├── user-management.service.spec.ts    (NUEVO)
├── system-metrics.service.spec.ts     (NUEVO)
└── admin.controller.spec.ts           (NUEVO)
```

**Cobertura esperada:**
- admin.service.ts: 70%
- user-management.service.ts: 75%
- system-metrics.service.ts: 65%
- admin.controller.ts: 70%

#### Prioridad ALTA (Días 3-6)

**3. Progress Module (3 archivos)**
```
apps/backend/src/modules/progress/__tests__/
├── progress.service.spec.ts      (NUEVO)
├── statistics.service.spec.ts    (NUEVO)
└── analytics.service.spec.ts     (NUEVO)
```

**4. Educational Module (2 archivos)**
```
apps/backend/src/modules/educational/__tests__/
├── module.service.spec.ts        (NUEVO)
└── exercise.service.spec.ts      (NUEVO)
```

**Cobertura esperada:** 70% por archivo

---

### FRONTEND TESTING (22 archivos nuevos)

#### Prioridad CRÍTICA (Días 3-4)

**1. Auth Feature (5 archivos)**
```
apps/frontend/src/features/auth/__tests__/
├── authStore.test.ts             (AMPLIAR EXISTENTE)
├── LoginForm.test.tsx            (NUEVO)
├── RegisterForm.test.tsx         (NUEVO)
├── ForgotPasswordForm.test.tsx   (NUEVO)
└── hooks/
    └── useAuth.test.ts           (NUEVO)
```

**Cobertura esperada:**
- authStore: 85% (actualmente ~60%)
- LoginForm: 80%
- RegisterForm: 80%
- ForgotPasswordForm: 75%
- useAuth: 80%

**2. Gamification Stores (6 archivos)**
```
apps/frontend/src/features/gamification/__tests__/
├── economy/
│   └── economyStore.test.ts      (NUEVO)
├── ranks/
│   └── ranksStore.test.ts        (NUEVO)
├── social/
│   ├── achievementsStore.test.ts (NUEVO)
│   ├── friendsStore.test.ts      (NUEVO)
│   ├── guildsStore.test.ts       (NUEVO)
│   └── powerUpsStore.test.ts     (NUEVO)
```

**Cobertura esperada:** 75% por store

#### Prioridad ALTA (Días 5-8)

**3. Shared Components (5 archivos)**
```
apps/frontend/src/shared/components/__tests__/
├── Button.test.tsx               (NUEVO)
├── Modal.test.tsx                (NUEVO)
├── Card.test.tsx                 (NUEVO)
├── Input.test.tsx                (NUEVO)
└── Spinner.test.tsx              (NUEVO)
```

**4. API Services (3 archivos)**
```
apps/frontend/src/services/__tests__/
├── educationalAPI.test.ts        (NUEVO)
├── missionsAPI.test.ts           (NUEVO)
└── notificationsAPI.test.ts      (NUEVO)
```

**5. Custom Hooks (3 archivos)**
```
apps/frontend/src/shared/hooks/__tests__/
├── useFetch.test.ts              (NUEVO)
├── useDebounce.test.ts           (NUEVO)
└── useLocalStorage.test.ts       (NUEVO)
```

**Cobertura esperada:** 70% por archivo

---

### INTEGRACIONES (Días 5 y 9)

#### 1. SendGrid Email Notifications (Día 5)

**Tareas:**
1. Crear cuenta SendGrid (si no existe)
2. Obtener API Key
3. Configurar en backend:
   ```typescript
   // apps/backend/src/config/sendgrid.config.ts
   export const sendgridConfig = {
     apiKey: process.env.SENDGRID_API_KEY,
     fromEmail: process.env.SENDGRID_FROM_EMAIL,
     fromName: 'GAMILIT',
   };
   ```

4. Crear templates de email:
   - Email de verificación
   - Reset de password
   - Notificaciones de logros
   - Reportes semanales

5. Implementar en mail.service.ts:
   - sendVerificationEmail()
   - sendPasswordResetEmail()
   - sendAchievementEmail()
   - sendWeeklyReport()

6. Tests de integración:
   ```
   apps/backend/src/modules/mail/__tests__/
   ├── mail.service.spec.ts
   └── integration/
       └── sendgrid.integration.spec.ts
   ```

7. Documentar en:
   ```
   apps/backend/docs/SENDGRID_SETUP.md
   ```

**Validación:**
- [ ] Envío de email de verificación funcional
- [ ] Envío de email de password reset funcional
- [ ] Templates responsive
- [ ] Logs de envío correctos

#### 2. Firebase FCM Push Notifications (Día 9)

**Tareas:**
1. Crear proyecto Firebase (si no existe)
2. Obtener Server Key y credentials
3. Configurar en backend:
   ```typescript
   // apps/backend/src/config/firebase.config.ts
   import * as admin from 'firebase-admin';

   admin.initializeApp({
     credential: admin.credential.cert({
       projectId: process.env.FIREBASE_PROJECT_ID,
       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
       privateKey: process.env.FIREBASE_PRIVATE_KEY,
     }),
   });
   ```

4. Implementar en notifications.service.ts:
   - sendPushNotification()
   - sendBatchPushNotifications()
   - subscribeTopic()
   - unsubscribeTopic()

5. Configurar en frontend:
   ```typescript
   // apps/frontend/src/config/firebase.config.ts
   import { initializeApp } from 'firebase/app';
   import { getMessaging } from 'firebase/messaging';

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
   };
   ```

6. Tests:
   ```
   apps/backend/src/modules/notifications/__tests__/
   ├── push-notifications.service.spec.ts
   └── integration/
       └── fcm.integration.spec.ts
   ```

7. Documentar en:
   ```
   apps/backend/docs/FIREBASE_FCM_SETUP.md
   docs/95-guias-desarrollo/PUSH-NOTIFICATIONS.md
   ```

**Validación:**
- [ ] Push notification en web funcional
- [ ] Push notification en móvil (PWA) funcional
- [ ] Batch notifications funcional
- [ ] Topics subscription funcional

---

## 🛠️ HERRAMIENTAS Y SETUP

### Backend Testing Stack
```json
{
  "@nestjs/testing": "^10.0.0",
  "jest": "^29.5.0",
  "@types/jest": "^29.5.0",
  "supertest": "^6.3.3",
  "@types/supertest": "^2.0.12"
}
```

### Frontend Testing Stack
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.1.4",
  "@testing-library/user-event": "^14.5.1",
  "vitest": "^1.0.4",
  "@vitest/ui": "^1.0.4",
  "jsdom": "^23.0.1"
}
```

### Coverage Configuration

**Backend (jest.config.js):**
```javascript
module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
};
```

**Frontend (vitest.config.ts):**
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
      ],
      thresholds: {
        lines: 25,
        functions: 25,
        branches: 25,
        statements: 25,
      },
    },
  },
});
```

---

## 📋 CHECKLIST DE PROGRESO

### Semana 1

#### Día 1: Backend Auth Tests
- [ ] Setup jest en módulo auth
- [ ] auth.service.spec.ts (100+ líneas)
- [ ] jwt.service.spec.ts (80+ líneas)
- [ ] rbac.service.spec.ts (80+ líneas)
- [ ] session.service.spec.ts (60+ líneas)
- [ ] auth.controller.spec.ts (100+ líneas)
- [ ] Ejecutar coverage: >= 20%

#### Día 2: Backend Admin y Progress Tests
- [ ] admin.service.spec.ts
- [ ] user-management.service.spec.ts
- [ ] system-metrics.service.spec.ts
- [ ] admin.controller.spec.ts
- [ ] progress.service.spec.ts
- [ ] Ejecutar coverage: >= 26%

#### Día 3: Frontend Auth Tests
- [ ] Ampliar authStore.test.ts
- [ ] LoginForm.test.tsx
- [ ] RegisterForm.test.tsx
- [ ] ForgotPasswordForm.test.tsx
- [ ] useAuth.test.ts
- [ ] Ejecutar coverage: >= 19%

#### Día 4: Frontend Stores Tests
- [ ] economyStore.test.ts
- [ ] ranksStore.test.ts
- [ ] achievementsStore.test.ts
- [ ] friendsStore.test.ts
- [ ] guildsStore.test.ts
- [ ] powerUpsStore.test.ts
- [ ] Ejecutar coverage: >= 25%

#### Día 5: SendGrid Setup
- [ ] Crear cuenta SendGrid
- [ ] Configurar API Key
- [ ] Crear templates de email (4)
- [ ] Implementar funciones de envío
- [ ] Tests de integración
- [ ] Documentación completa
- [ ] Validación: envío de email funcional

### Semana 2

#### Día 6: Backend Educational y Gamification Tests
- [ ] module.service.spec.ts
- [ ] exercise.service.spec.ts
- [ ] Ampliar gamification tests
- [ ] Ejecutar coverage: >= 30%

#### Día 7: Frontend Components Tests
- [ ] Button.test.tsx
- [ ] Modal.test.tsx
- [ ] Card.test.tsx
- [ ] Input.test.tsx
- [ ] Spinner.test.tsx
- [ ] Ejecutar coverage: >= 27%

#### Día 8: Frontend APIs Tests
- [ ] educationalAPI.test.ts
- [ ] missionsAPI.test.ts
- [ ] notificationsAPI.test.ts
- [ ] useFetch.test.ts
- [ ] useDebounce.test.ts
- [ ] useLocalStorage.test.ts
- [ ] Ejecutar coverage: >= 30%

#### Día 9: Firebase FCM Setup
- [ ] Crear proyecto Firebase
- [ ] Configurar credenciales
- [ ] Implementar FCM en backend
- [ ] Implementar FCM en frontend
- [ ] Tests de push notifications
- [ ] Documentación completa
- [ ] Validación: push funcional

#### Día 10: Validación Final
- [ ] Ejecutar test suite completa backend
- [ ] Ejecutar test suite completa frontend
- [ ] Verificar coverage >= 30% backend
- [ ] Verificar coverage >= 25% frontend
- [ ] Validar SendGrid funcional
- [ ] Validar FCM funcional
- [ ] Generar reporte Sprint 1
- [ ] Actualizar inventarios

---

## 📈 MÉTRICAS DE SEGUIMIENTO

### Coverage Diario

| Día | Backend | Frontend | Total | Nuevos Tests |
|-----|---------|----------|-------|--------------|
| 0 | 18% | 13% | 15% | 10 |
| 1 | 20% | 13% | 16% | 6 |
| 2 | 26% | 13% | 19% | 4 |
| 3 | 26% | 19% | 22% | 5 |
| 4 | 26% | 25% | 25% | 6 |
| 5 | 26% | 25% | 25% | 0 (integración) |
| 6 | 30% | 25% | 27% | 3 |
| 7 | 30% | 27% | 28% | 5 |
| 8 | 30% | 30% | 30% | 6 |
| 9 | 30% | 30% | 30% | 0 (integración) |
| 10 | 30% | 30% | 30% | 0 (validación) |
| **META** | **30%** | **25%+** | **28%** | **40+** |

---

## 🎯 DEFINICIÓN DE DONE

### Tests Backend
- [ ] Cada test file tiene al menos 5 test cases
- [ ] Tests unitarios para lógica de negocio
- [ ] Tests de integración para controllers
- [ ] Mocks apropiados para dependencias externas
- [ ] Coverage >= 70% por archivo testeado
- [ ] Todos los tests pasan en CI/CD

### Tests Frontend
- [ ] Cada test file tiene al menos 4 test cases
- [ ] Tests para render correcto
- [ ] Tests para interacciones de usuario
- [ ] Tests para estados de error
- [ ] Mocks para APIs y stores
- [ ] Coverage >= 70% por archivo testeado
- [ ] Todos los tests pasan en CI/CD

### Integraciones
- [ ] Configuración documentada
- [ ] Variables de entorno definidas
- [ ] Tests de integración funcionales
- [ ] Validación manual exitosa
- [ ] Logs apropiados
- [ ] Manejo de errores robusto

---

## 🚧 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Tiempo insuficiente para 40 tests | MEDIA | ALTO | Priorizar tests críticos, extender a 3 días si es necesario |
| Dependencias externas de testing | BAJA | MEDIO | Usar mocks agresivamente |
| SendGrid API limits | BAJA | MEDIO | Usar sandbox mode para tests |
| Firebase setup complejo | MEDIA | MEDIO | Seguir guía oficial, asignar tiempo extra día 9 |
| Coverage no alcanza meta | MEDIA | ALTO | Foco en archivos con lógica compleja, no getters/setters |

---

## 📚 RECURSOS

### Documentación
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [SendGrid Node.js Guide](https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

### Templates
- `apps/backend/__tests__/templates/service.spec.template.ts`
- `apps/backend/__tests__/templates/controller.spec.template.ts`
- `apps/frontend/__tests__/templates/component.test.template.tsx`
- `apps/frontend/__tests__/templates/store.test.template.ts`

---

## 👥 EQUIPO Y ASIGNACIONES

### Testing Backend (2 devs)
- **Dev 1:** Auth + Admin modules (Días 1-2)
- **Dev 2:** Progress + Educational modules (Días 2-6)

### Testing Frontend (2 devs)
- **Dev 3:** Auth feature + Stores (Días 3-4)
- **Dev 4:** Components + APIs (Días 7-8)

### Integraciones (1 dev)
- **Dev 5:** SendGrid (Día 5) + Firebase FCM (Día 9)

### QA (1 tester)
- Validación continua y reporte final (Día 10)

---

## 📊 REPORTE FINAL

Al finalizar el Sprint 1, se generará:
- `SPRINT-1-REPORTE-FINAL-2025-11-22.md`
- Métricas de coverage alcanzado
- Tests implementados (lista completa)
- Integraciones activadas y validadas
- Lecciones aprendidas
- Recomendaciones para Sprint 2

---

**Inicio:** 2025-11-08
**Fin estimado:** 2025-11-22
**Estado:** 🚀 EN PROGRESO

---

**Creado por:** Claude Code - Sprint Planning
**Fecha:** 2025-11-08
**Versión:** 1.0
