# Servicios Principales - Índice

**Proyecto:** GAMILIT
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Estructura de Servicios

Este directorio contiene la documentación detallada de los servicios principales del backend de GAMILIT, organizados por área funcional.

---

## Servicios Disponibles

### 1. Servicios de Autenticación
**Archivo:** [Servicios-Autenticacion.md](./Servicios-Autenticacion.md)

Servicios relacionados con autenticación, autorización y gestión de sesiones:
- **AuthService** - Registro, login, tokens
- **SessionManagementService** - Gestión de sesiones
- **SecurityService** - Auditoría y logs de seguridad

**Líneas:** ~400

---

### 2. Servicios de Notificaciones
**Archivo:** [Servicios-Notificaciones.md](./Servicios-Notificaciones.md)

Servicios para notificaciones y comunicación en tiempo real:
- **NotificationsService** - Notificaciones persistentes
- **RealtimeService** - WebSocket y tiempo real

**Líneas:** ~400

---

### 3. Servicios de Gamificación
**Archivo:** [Servicios-Gamificacion.md](./Servicios-Gamificacion.md)

Servicios del sistema de gamificación:
- **GamificationService** - ML Coins, XP, logros
- **MissionsService** - Misiones diarias y semanales
- **EducationalService** - Módulos y ejercicios
- **ClassroomService** - Aulas virtuales

**Líneas:** ~500

---

## Navegación Rápida

### Por Responsabilidad

| Área | Servicios | Archivo |
|------|-----------|---------|
| **Auth & Security** | AuthService, SessionManagement, Security | [Servicios-Autenticacion.md](./Servicios-Autenticacion.md) |
| **Comunicación** | Notifications, Realtime | [Servicios-Notificaciones.md](./Servicios-Notificaciones.md) |
| **Gamificación** | Gamification, Missions | [Servicios-Gamificacion.md](./Servicios-Gamificacion.md) |
| **Educación** | Educational, Classroom | [Servicios-Gamificacion.md](./Servicios-Gamificacion.md) |

---

## Convenciones de Servicios

### Constructor Dependency Injection
```typescript
export class MyService {
  constructor(
    private repository: MyRepository,
    private otherService?: OtherService
  ) {}
}
```

### Manejo de Errores
```typescript
try {
  // Lógica de negocio
} catch (error) {
  if (error instanceof AppError) {
    throw error;  // Re-throw custom errors
  }
  log.error('Error in service:', error);
  throw new AppError('Generic message', 500, ErrorCode.INTERNAL_ERROR);
}
```

### Uso de dbClient Opcional
```typescript
async method(userId: string, dbClient?: PoolClient) {
  // Si se provee dbClient, usar para transacciones
  // Si no, usar pool directamente
}
```

---

## Diagrama de Interacción

```
┌─────────────────────────────────────────────────────────────┐
│                        Controller                            │
│                     (HTTP Request)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    AuthService                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ - register()                                         │   │
│  │ - login() ─────────────┐                            │   │
│  │ - refreshToken()       │                            │   │
│  └──────────┬─────────────┘                            │   │
│             │                                           │   │
│             ↓                                           │   │
│  ┌──────────────────────┐    ┌──────────────────────┐  │   │
│  │ SessionManagement    │    │  SecurityService     │  │   │
│  │ Service              │    │                      │  │   │
│  │ - createSession()    │    │ - logSecurityEvent() │  │   │
│  │ - getActive()        │    │ - detectSuspicious() │  │   │
│  └──────────────────────┘    └──────────────────────┘  │   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ↓
       ┌────────────────────────┐
       │   AuthRepository       │
       │   (Database Access)    │
       └────────────────────────┘
```

---

## Documentos Relacionados

- [API Endpoints](../api/README.md) - Documentación de API REST
- [Middleware y Seguridad](../middleware/README.md) - Middlewares de seguridad
- [Arquitectura del Backend](../ARQUITECTURA.md) - Visión general

---

## Contribuir

Al documentar nuevos servicios:
1. Seguir estructura de servicios existentes
2. Incluir ejemplos de uso
3. Documentar todos los métodos públicos
4. Especificar tipos de retorno
5. Listar posibles errores
6. Actualizar este README

---

**Última revisión:** 2025-11-01
