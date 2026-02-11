---
id: "US-LTI-004"
title: "Platform Configuration UI"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-007"
story_points: 8
budget: "$1,200 USD"
sprint: "Sprint-17"
labels: ["lti", "admin", "configuration", "platform", "canvas", "moodle", "blackboard"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-LTI-004: Platform Configuration UI

**Épica:** EXT-007: LTI Integration
**Prioridad:** P1
**Story Points:** 8
**Esfuerzo:** 8 horas
**Costo:** $1,200 USD
**Sprint:** 17

---

## 📋 User Story

```
Como administrador de GAMILIT
Quiero configurar nuevas plataformas LMS (Canvas, Moodle) desde un panel
Para habilitar LTI integration sin tocar la base de datos directamente
```

---

## 🎯 Contexto de Negocio

### Problema Actual
- Configuración LTI requiere SQL inserts manuales
- Riesgo de errores (typos en URLs, keys incorrectas)
- No escalable (cada institución necesita soporte técnico)

### Solución
- Admin UI para registrar plataformas LMS
- Form validation con detección automática de endpoints
- Testing de conexión integrado

### Valor
- **Time to onboard:** 10 minutos vs 2 horas (SQL manual)
- **Error rate:** 0% vs 15%
- **Self-service:** Admins institucionales pueden configurar

---

## ✅ Criterios de Aceptación

### Funcionales

1. **Platform List Page:**
   - [ ] Admin Portal: `/admin/lti/platforms`
   - [ ] Tabla con plataformas registradas:
     - Platform Name, Issuer, Client ID, Status, Actions
   - [ ] Botón "Add Platform"
   - [ ] Acciones: Edit, Delete, Test Connection

2. **Add/Edit Platform Form:**
   - [ ] Form fields:
     - **Platform Name** (text): "Canvas - Universidad X"
     - **Platform Type** (select): Canvas, Moodle, Blackboard, Other
     - **Issuer** (URL): `https://canvas.instructure.com`
     - **Client ID** (text): GAMILITs client ID in LMS
     - **Deployment ID** (text): Deployment identifier
     - **Auth Login URL** (URL): OIDC login endpoint
     - **Auth Token URL** (URL): OAuth2 token endpoint
     - **Key Set URL** (URL): JWKS endpoint
   - [ ] Auto-fill URLs si Platform Type != "Other"
   - [ ] Validation:
     - All fields required
     - URLs valid format (https://)
     - Client ID unique per tenant

3. **Auto-detection (Canvas):**
   - [ ] Si Platform Type = Canvas:
     - User solo ingresa Issuer
     - GAMILITauto-completa:
       - `auth_login_url`: `{issuer}/api/lti/authorize_redirect`
       - `auth_token_url`: `{issuer}/login/oauth2/token`
       - `key_set_url`: `{issuer}/api/lti/security/jwks`

4. **Key Management:**
   - [ ] GAMILITauto-genera par de claves (RSA 2048)
   - [ ] Muestra Public Key JWK para copiar a LMS
   - [ ] Private key guardada encriptada en DB

5. **Test Connection:**
   - [ ] Botón "Test Connection"
   - [ ] GAMILIThace request a `key_set_url`
   - [ ] Valida response (200 OK, JWKS válido)
   - [ ] Muestra success/error message

6. **Platform Status:**
   - [ ] Toggle Active/Inactive
   - [ ] Si inactive → LTI launches rechazados

### No Funcionales

7. **Security:**
   - [ ] Solo admins pueden acceder
   - [ ] Audit log de cambios en configuración
   - [ ] Private keys encriptadas (AES-256)

8. **UX:**
   - [ ] Tooltips explicativos en cada field
   - [ ] Link a documentación LMS (Canvas, Moodle)
   - [ ] Copy button para Public Key JWK

---

## 🔧 Tareas Técnicas

### Backend (4h)

1. **CRUD Endpoints (2h)**
   - [ ] `GET /api/v1/admin/lti/platforms` - List
   - [ ] `POST /api/v1/admin/lti/platforms` - Create
   - [ ] `PUT /api/v1/admin/lti/platforms/:id` - Update
   - [ ] `DELETE /api/v1/admin/lti/platforms/:id` - Delete
   - [ ] DTOs: `CreatePlatformDto`, `UpdatePlatformDto`

2. **Key Generation (1h)**
   - [ ] Service para generar RSA key pair
   - [ ] Exportar public key en formato JWK
   - [ ] Encriptar private key antes de guardar

3. **Connection Testing (1h)**
   - [ ] Endpoint `POST /api/v1/admin/lti/platforms/:id/test`
   - [ ] Fetch `key_set_url`
   - [ ] Validate JWKS response
   - [ ] Return status + error details

### Frontend (4h)

4. **Platform List Page (1h)**
   - [ ] Table component con React Table
   - [ ] Search/filter por platform name
   - [ ] Status badge (Active/Inactive)

5. **Platform Form (2h)**
   - [ ] Form con React Hook Form + Zod validation
   - [ ] Auto-fill logic por Platform Type
   - [ ] JWK display modal con copy button
   - [ ] Tooltips con react-tooltip

6. **Test Connection UI (1h)**
   - [ ] "Test Connection" button
   - [ ] Loading spinner
   - [ ] Success toast con checkmark
   - [ ] Error toast con details

---

## 🧪 Escenarios de Testing

### Happy Path
```
Given: Admin quiere configurar Canvas LTI
When: Selecciona Platform Type = "Canvas"
  And: Ingresa Issuer = "https://canvas.university.edu"
  And: Ingresa Client ID = "12345"
  And: Ingresa Deployment ID = "1"
Then:
  - URLs auto-completadas
  - Public key generada automáticamente
  - Puede copiar JWK
  - Test Connection → Success
  - Platform guardada en DB
```

### Edge Cases

1. **Invalid JWKS URL:**
   ```
   When: Admin ingresa Key Set URL inválido
     And: Hace clic "Test Connection"
   Then:
     - Request falla con timeout/404
     - Error message: "No se pudo conectar a {url}. Verifica la URL."
   ```

2. **Duplicate Client ID:**
   ```
   When: Admin intenta crear platform con Client ID existente
   Then:
     - Validation error: "Client ID ya existe para este tenant"
     - Form no se envía
   ```

---

## 📊 Métricas de Éxito

### Post-Lanzamiento
- **Self-service adoption:** >80% instituciones configuran sin soporte
- **Configuration errors:** <5%
- **Time to configure:** <15 minutos promedio

---

## 🔗 Dependencias

### Bloqueado por
- Admin Portal base implementado
- Tabla `lti_platforms` en DB

---

**Creado:** 2025-11-07
**Asignado a:** Full-stack Team
