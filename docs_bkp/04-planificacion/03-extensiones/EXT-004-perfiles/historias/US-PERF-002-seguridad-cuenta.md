# US-PERF-002: Gestión Avanzada de Seguridad de Cuenta

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-PERF-002 |
| **Épica** | EXT-004 - Perfiles Avanzados |
| **Título** | Sistema de Seguridad y Gestión de Sesiones |
| **Prioridad** | Alta (P1) |
| **Story Points** | 5 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $2,500 MXN |

---

## Historia de Usuario

**Como** usuario de la plataforma Gamilit
**Quiero** gestionar la seguridad de mi cuenta con 2FA, cambio de contraseña, gestión de sesiones y descarga de datos
**Para** proteger mi información, controlar accesos y ejercer mis derechos de privacidad (GDPR)

---

## Valor de Negocio

### Impacto
- **Seguridad**: Reducción 70% en cuentas comprometidas con 2FA
- **Confianza**: Usuarios sienten control sobre sus datos
- **Compliance**: Cumplimiento GDPR/FERPA obligatorio
- **Transparencia**: Visibilidad de accesos genera confianza

### Métricas de Éxito
- >40% usuarios activan 2FA en 3 meses
- >60% usuarios revisan sesiones activas al menos 1 vez/mes
- <0.5% incidentes de seguridad reportados
- 100% solicitudes de descarga de datos procesadas en <24h

---

## Criterios de Aceptación

### CA-01: Cambio de Contraseña Seguro
**Dado** que un usuario cambia su contraseña
**Cuando** accede a la opción de cambio
**Entonces** debe:
- Ingresar contraseña actual (validación requerida)
- Ingresar nueva contraseña con requisitos:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 minúscula
  - Al menos 1 número
  - Al menos 1 carácter especial (@#$%^&*)
- Confirmar nueva contraseña (match validation)
- Ver indicador de fortaleza de contraseña en tiempo real:
  - Débil (rojo): cumple mínimos
  - Media (amarillo): 10+ caracteres + variedad
  - Fuerte (verde): 12+ caracteres + alta entropía
- Recibir confirmación por email del cambio
- Cerrar todas las sesiones activas excepto la actual
- No permitir reutilizar últimas 5 contraseñas

### CA-02: Autenticación de Dos Factores (2FA)
**Dado** que el usuario activa 2FA
**Cuando** configura la autenticación de dos factores
**Entonces** debe poder:
- **Activación**:
  - Escanear QR code con app autenticadora (Google Authenticator, Authy)
  - Ver código secreto para ingreso manual
  - Ingresar código de 6 dígitos para verificar configuración
  - Descargar códigos de respaldo (10 códigos de un solo uso)
- **Uso**:
  - Después de login con contraseña, solicitar código 2FA
  - Opción "Confiar en este dispositivo por 30 días"
  - Usar código de respaldo si pierde acceso a app
- **Desactivación**:
  - Requiere contraseña actual + código 2FA
  - Confirmación con modal de advertencia
  - Notificación por email de desactivación
- **Recuperación**:
  - Si pierde acceso, usar códigos de respaldo
  - Soporte puede desactivar 2FA con verificación de identidad

### CA-03: Gestión de Sesiones Activas
**Dado** que el usuario visualiza sesiones activas
**Cuando** accede a la lista de dispositivos conectados
**Entonces** debe ver para cada sesión:
- **Información**:
  - Dispositivo: "Chrome en Windows 10", "Safari en iPhone 12"
  - Ubicación aproximada: "Ciudad de México, México"
  - Dirección IP (parcialmente oculta): "192.168.***.***"
  - Última actividad: "Hace 5 minutos", "Hace 2 días"
  - Estado: "Sesión actual" o "Activa"
- **Acciones**:
  - [Cerrar Sesión] en sesiones individuales
  - [Cerrar Todas las Sesiones] excepto la actual
  - Ver confirmación antes de cerrar
  - Al cerrar, dispositivo debe requerir nuevo login
- **Alertas**:
  - Notificación si login desde nuevo dispositivo/ubicación
  - Marcar sesiones sospechosas (ubicación extraña, IP desconocida)
  - Botón rápido [¿No eres tú? Cerrar y Cambiar Contraseña]

### CA-04: Historial de Accesos
**Dado** que el usuario monitorea accesos a su cuenta
**Cuando** visualiza el historial
**Entonces** debe ver:
- Últimos 50 intentos de acceso (exitosos y fallidos)
- Por evento:
  - Tipo: "Login exitoso", "Login fallido", "Contraseña cambiada", "2FA activado"
  - Fecha y hora exacta
  - Dispositivo y navegador
  - Ubicación aproximada
  - IP address (parcialmente oculta)
- Filtros: Todos / Solo exitosos / Solo fallidos / Solo cambios de configuración
- Búsqueda por fecha o tipo
- Exportar historial a CSV
- Alertas de actividad sospechosa:
  - Múltiples logins fallidos (5+ en 1 hora)
  - Login desde país diferente al habitual
  - Cambio de contraseña no iniciado por usuario

### CA-05: Descarga de Datos Personales (GDPR)
**Dado** que el usuario solicita descarga de sus datos
**Cuando** activa la opción "Descargar mis Datos"
**Entonces** el sistema debe:
- **Solicitud**:
  - Confirmar identidad (requiere contraseña actual)
  - Explicar qué datos se incluirán
  - Estimar tiempo de generación (típicamente <24h)
  - Confirmar con botón [Solicitar Descarga]
- **Procesamiento**:
  - Generar archivo ZIP encriptado con:
    - Información de perfil (JSON)
    - Historial de actividades (CSV)
    - Estadísticas de progreso (PDF)
    - Logros y recompensas (JSON)
    - Historial de transacciones (CSV)
    - Configuraciones y preferencias (JSON)
  - Enviar email cuando esté listo
  - Link de descarga válido por 7 días
- **Seguridad**:
  - Archivo protegido con contraseña
  - Link único con token de seguridad
  - Audit log de solicitud de descarga
- **Frecuencia**:
  - Máximo 1 solicitud por semana
  - Cooldown de 7 días entre solicitudes

### CA-06: Eliminación de Cuenta
**Dado** que el usuario solicita eliminar su cuenta
**Cuando** activa la opción "Eliminar mi Cuenta"
**Entonces** debe:
- **Advertencias**:
  - Modal de confirmación con advertencias claras:
    - "Esta acción es irreversible"
    - "Perderás todo tu progreso, logros y recompensas"
    - "Tus datos serán eliminados permanentemente en 30 días"
  - Checkbox: "Entiendo que esta acción es permanente"
  - Checkbox: "Confirmo que quiero eliminar mi cuenta"
- **Verificación**:
  - Ingresar contraseña actual
  - Si tiene 2FA activado, ingresar código
  - Escribir frase de confirmación: "ELIMINAR MI CUENTA"
  - Razón de eliminación (opcional): dropdown + texto libre
- **Proceso**:
  - Cuenta marcada para eliminación (soft delete)
  - Período de gracia de 30 días para cancelar
  - Email de confirmación con link de cancelación
  - Después de 30 días: eliminación permanente (hard delete)
  - Anonymización de datos históricos (analytics)
- **Restricciones**:
  - Si es profesor con clases activas: advertir y requerir transferencia
  - Si tiene suscripción activa: cancelar primero

### CA-07: Preguntas de Seguridad
**Dado** que el usuario configura recuperación de cuenta
**Cuando** establece preguntas de seguridad
**Entonces** puede:
- Seleccionar 3 preguntas de lista predefinida (20+ opciones):
  - "¿Cuál es el nombre de tu primera mascota?"
  - "¿En qué ciudad naciste?"
  - "¿Cuál es el nombre de tu libro favorito?"
  - etc.
- Ingresar respuestas (mínimo 3 caracteres)
- Respuestas guardadas con hash (no en texto plano)
- Usar preguntas para:
  - Recuperación de contraseña (alternativa a email)
  - Verificación de identidad para soporte
  - Desactivación de 2FA en emergencias
- Cambiar preguntas/respuestas:
  - Requiere contraseña actual
  - Máximo 3 cambios por mes

### CA-08: Email de Recuperación
**Dado** que el usuario configura email de recuperación
**Cuando** establece un email secundario
**Entonces** debe:
- Ingresar email de recuperación (diferente al principal)
- Recibir código de verificación en ese email
- Ingresar código para confirmar (válido 15 minutos)
- Ver estado: "Verificado ✓" o "Pendiente de verificación"
- Usar email de recuperación para:
  - Recibir códigos de reset de contraseña
  - Notificaciones de actividad sospechosa
  - Backup si pierde acceso a email principal
- Actualizar email de recuperación:
  - Requiere contraseña actual
  - Reverificar nuevo email

### CA-09: Notificaciones de Seguridad
**Dado** que ocurre evento de seguridad
**Cuando** se detecta actividad relevante
**Entonces** el usuario debe recibir:
- **Email inmediato** para:
  - Login desde nuevo dispositivo
  - Contraseña cambiada
  - 2FA activado/desactivado
  - Email principal modificado
  - Solicitud de eliminación de cuenta
  - Múltiples intentos fallidos de login
- **Notificación in-app** para:
  - Nueva sesión activa
  - Sesión cerrada remotamente
  - Actualización de configuración de privacidad
- **SMS** (opcional, si configurado) para:
  - Eventos críticos de seguridad
  - Códigos de verificación como alternativa a email

### CA-10: Configuración de Privacidad de Datos
**Dado** que el usuario gestiona permisos de datos
**Cuando** accede a configuración de privacidad
**Entonces** puede:
- **Consentimientos**:
  - Compartir datos de analytics (sí/no)
  - Permitir uso de datos para investigación educativa (sí/no)
  - Recibir comunicaciones de marketing (sí/no)
  - Permitir personalización basada en comportamiento (sí/no)
- Ver política de privacidad completa
- Ver qué datos se recopilan y por qué
- Revisar y revocar permisos en cualquier momento
- Audit log de cambios en consentimientos

---

## Especificaciones Técnicas

### Frontend Components
```
src/pages/security/
├── SecurityPage.tsx
├── sections/
│   ├── PasswordChangeSection.tsx
│   ├── TwoFactorSection.tsx
│   ├── SessionsSection.tsx
│   ├── AccessHistorySection.tsx
│   ├── DataDownloadSection.tsx
│   ├── AccountDeletionSection.tsx
│   └── PrivacySettingsSection.tsx
└── components/
    ├── TwoFactorSetup.tsx
    ├── QRCodeDisplay.tsx
    ├── BackupCodesDisplay.tsx
    ├── SessionCard.tsx
    ├── AccessLogItem.tsx
    └── PasswordStrengthIndicator.tsx
```

### TypeScript Interfaces
```typescript
interface SecuritySettings {
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  recoveryEmail?: string;
  recoveryEmailVerified: boolean;
  securityQuestions?: SecurityQuestion[];
  lastPasswordChange: Date;
}

interface Session {
  sessionId: string;
  deviceInfo: string;
  browser: string;
  os: string;
  ipAddress: string; // Parcialmente oculta
  location: string; // Ciudad, País
  lastActivity: Date;
  createdAt: Date;
  isCurrent: boolean;
}

interface AccessLog {
  id: string;
  userId: string;
  eventType: 'login_success' | 'login_failed' | 'password_changed' | '2fa_enabled' | '2fa_disabled';
  timestamp: Date;
  deviceInfo: string;
  ipAddress: string;
  location: string;
  success: boolean;
}

interface DataExportRequest {
  requestId: string;
  userId: string;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  requestedAt: Date;
  readyAt?: Date;
  downloadUrl?: string;
  expiresAt?: Date;
}
```

### API Endpoints
```typescript
// POST /api/security/password/change
// POST /api/security/2fa/enable
// POST /api/security/2fa/disable
// GET /api/security/sessions
// DELETE /api/security/sessions/:sessionId
// DELETE /api/security/sessions/all
// GET /api/security/access-log
// POST /api/security/data-export/request
// GET /api/security/data-export/:requestId/download
// POST /api/security/account/delete
// POST /api/security/account/cancel-deletion
```

---

## Definición de Terminado (DoD)

- [ ] Componente SecurityPage implementado
- [ ] Cambio de contraseña con validaciones
- [ ] Indicador de fortaleza de contraseña
- [ ] Setup completo de 2FA con QR code
- [ ] Códigos de respaldo generados y descargables
- [ ] Gestión de sesiones activas
- [ ] Cierre de sesiones remotas
- [ ] Historial de accesos con filtros
- [ ] Solicitud de descarga de datos (GDPR)
- [ ] Generación de archivo ZIP encriptado
- [ ] Proceso de eliminación de cuenta con período de gracia
- [ ] Preguntas de seguridad
- [ ] Email de recuperación con verificación
- [ ] Notificaciones de seguridad (email + in-app)
- [ ] Configuración de privacidad de datos
- [ ] Tests unitarios >85% coverage
- [ ] Tests de integración para flujos críticos
- [ ] Tests de seguridad (penetration testing)
- [ ] API endpoints documentados
- [ ] Audit logging completo
- [ ] Compliance GDPR/FERPA verificado

---

## Dependencias

### Depende de
- **EAI-001**: Sistema de autenticación básico
- **US-PERF-001**: Gestión de perfil

### Bloquea a
- Ninguna (feature independiente)

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Usuarios olvidan códigos de respaldo 2FA | Media | Alto | Forzar descarga, almacenar en DB encriptados |
| Solicitudes masivas de descarga (DoS) | Baja | Medio | Rate limiting, cooldown 7 días |
| Usuario elimina cuenta por error | Media | Alto | Período gracia 30 días, confirmaciones múltiples |
| Sesiones no se cierran correctamente | Baja | Medio | Timeout automático, validación server-side |

---

## Estimación Detallada (5 SP)

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Diseño UI/UX | 4h | UX Designer |
| Cambio de contraseña | 4h | Frontend Dev |
| 2FA setup (QR, códigos respaldo) | 8h | Fullstack Dev |
| Gestión de sesiones | 6h | Frontend Dev |
| Historial de accesos | 4h | Frontend Dev |
| Descarga de datos (GDPR) | 8h | Fullstack Dev |
| Eliminación de cuenta | 6h | Fullstack Dev |
| Preguntas de seguridad | 4h | Frontend Dev |
| Email recuperación | 4h | Backend Dev |
| Notificaciones de seguridad | 4h | Backend Dev |
| API endpoints | 8h | Backend Dev |
| Testing | 8h | QA + Devs |
| Documentación | 3h | Tech Lead |
| **TOTAL** | **71h** | |

**Presupuesto**: $2,500 MXN (~$145 USD)
**Duración Estimada**: 2 días (equipo de 4-5 personas)

---

## Tareas de Implementación

### Backend (9h - 45%)
- [ ] Implementar endpoint POST /api/security/password/change con validaciones (1.5h)
- [ ] Desarrollar sistema de 2FA con TOTP y QR code generation (3h)
- [ ] Crear endpoints de gestión de sesiones activas (1.5h)
- [ ] Implementar sistema de descarga de datos GDPR (ZIP encriptado) (2h)
- [ ] Desarrollar proceso de eliminación de cuenta con período de gracia (1h)

### Frontend (7h - 35%)
- [ ] Crear componente SecurityPage con secciones (1h)
- [ ] Implementar PasswordChangeSection con indicador de fortaleza (1.5h)
- [ ] Desarrollar TwoFactorSection con setup de QR y códigos de respaldo (2h)
- [ ] Crear SessionsSection con lista de dispositivos activos (1.5h)
- [ ] Implementar DataDownloadSection y AccountDeletionSection (1h)

### Testing y QA (3h - 15%)
- [ ] Escribir tests unitarios para componentes de seguridad (1.5h)
- [ ] Realizar tests de seguridad (penetration testing básico) (1h)
- [ ] Validar compliance GDPR/FERPA (0.5h)

### Deploy y Documentación (1h - 5%)
- [ ] Documentar API de seguridad en Swagger (0.5h)
- [ ] Crear guía de usuario para 2FA y seguridad (0.5h)

**Total Estimado**: 20h

---

## Cronograma

| Fase | Fecha Inicio Planificada | Fecha Fin Estimada | Horas | Estado |
|------|--------------------------|-------------------|-------|--------|
| Backend | 28 Oct 2024 | 29 Oct 2024 | 9h | Planificado |
| Frontend | 29 Oct 2024 | 30 Oct 2024 | 7h | Planificado |
| Testing | 30 Oct 2024 | 31 Oct 2024 | 3h | Planificado |
| Deploy | 31 Oct 2024 | 31 Oct 2024 | 1h | Planificado |

---

## Tags

#ext-004 #seguridad #2fa #sesiones #gdpr #privacidad #descarga-datos #eliminacion-cuenta #mes-3

---

**Creado**: 2025-11-02
**Última Actualización**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Estado**: Pendiente de Aprobación
**Versión**: 1.0
**Origen**: Migrado desde EP005/US-005-05-settings-page.md (sección de seguridad extraída)
**Compliance**: PF-001 (398 líneas < 400L límite)
