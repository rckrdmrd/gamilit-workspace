# VALIDACIÓN: CORR-005 - Corregir Vista admin_dashboard.recent_activity

**Fecha:** 2025-11-24
**Agente:** Database-Agent
**Prioridad:** P0 CRÍTICO

---

## 📋 CHECKLIST DE VALIDACIÓN

### ✅ Validaciones Completadas (Sin Acceso a BD)

- [x] **Sintaxis SQL verificada:** Query es sintácticamente correcto
- [x] **Mapeo de campos validado:** Todos los campos existen en tabla origen
- [x] **Compatibilidad backend verificada:** Vista es compatible con DTOs
- [x] **Documentación completa:** 4 documentos creados
- [x] **Migration creado:** DB-131 con auto-validación
- [x] **DDL actualizado:** Siguiendo política DDL-First
- [x] **Permisos definidos:** GRANT SELECT incluido

### ⏳ Validaciones Pendientes (Requieren Acceso a BD)

- [ ] **Recreación completa:** `./drop-and-recreate-database.sh`
- [ ] **Query de prueba:** `SELECT * FROM admin_dashboard.recent_activity LIMIT 5;`
- [ ] **Estructura de columnas:** Verificar con `information_schema.columns`
- [ ] **Backend endpoint:** Test de `GET /api/admin/actions/recent`
- [ ] **Portal Admin UI:** Verificar sección "Acciones Recientes"

---

## 🧪 PLAN DE TESTING

### Test 1: Validación de DDL (Política DDL-First)

**Objetivo:** Verificar que la recreación completa de BD funciona

**Comando:**
```bash
cd apps/database
export DATABASE_URL="postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform"
./drop-and-recreate-database.sh $DATABASE_URL
```

**Criterios de éxito:**
- ✅ Script ejecuta sin errores
- ✅ Vista `admin_dashboard.recent_activity` se crea
- ✅ NO hay errores de "relation does not exist"
- ✅ Log muestra "Vista creada exitosamente"

**Resultado esperado:**
```
[INFO] Creando schemas...
[INFO] Creando tablas...
[INFO] Creando vistas...
[INFO] Vista admin_dashboard.recent_activity creada ✓
[SUCCESS] Base de datos recreada exitosamente
```

---

### Test 2: Query Básica

**Objetivo:** Verificar que la vista retorna datos sin errores

**Comando:**
```sql
SELECT * FROM admin_dashboard.recent_activity LIMIT 5;
```

**Criterios de éxito:**
- ✅ Query ejecuta sin errores
- ✅ Retorna datos (si hay actividad en últimos 30 días)
- ✅ Columnas retornadas son las esperadas

**Resultado esperado:**
```
 id | user_id | user_name | user_avatar | email | action_type | action_description | timestamp | ip_address | user_agent | details
----+---------+-----------+-------------+-------+-------------+--------------------+-----------+------------+------------+---------
 ... (5 rows)
```

**Si NO hay datos:**
```
 id | user_id | user_name | user_avatar | email | action_type | action_description | timestamp | ip_address | user_agent | details
----+---------+-----------+-------------+-------+-------------+--------------------+-----------+------------+------------+---------
(0 rows)
```

**Nota:** Array vacío es válido si no hay actividad registrada. Lo importante es que NO haya error.

---

### Test 3: Estructura de Columnas

**Objetivo:** Verificar que la vista tiene las 11 columnas esperadas

**Comando:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'admin_dashboard'
  AND table_name = 'recent_activity'
ORDER BY ordinal_position;
```

**Resultado esperado:**

| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | uuid | YES |
| user_id | uuid | YES |
| user_name | text | YES |
| user_avatar | text | YES |
| email | text | YES |
| action_type | text | YES |
| action_description | text | YES |
| timestamp | timestamp with time zone | YES |
| ip_address | inet | YES |
| user_agent | text | YES |
| details | jsonb | YES |

**Criterios de éxito:**
- ✅ 11 columnas en total
- ✅ Nombres coinciden con lo esperado
- ✅ Tipos de datos son correctos

---

### Test 4: Filtro de Tiempo

**Objetivo:** Verificar que solo retorna datos de últimos 30 días

**Comando:**
```sql
-- Crear dato de prueba viejo (más de 30 días)
INSERT INTO audit_logging.user_activity_logs (
  user_id, activity_type, action_detail, created_at
) VALUES (
  (SELECT id FROM auth_management.profiles LIMIT 1),
  'page_view',
  'Test old activity',
  NOW() - INTERVAL '35 days'
);

-- Crear dato de prueba reciente (dentro de 30 días)
INSERT INTO audit_logging.user_activity_logs (
  user_id, activity_type, action_detail, created_at
) VALUES (
  (SELECT id FROM auth_management.profiles LIMIT 1),
  'page_view',
  'Test recent activity',
  NOW() - INTERVAL '5 days'
);

-- Consultar vista
SELECT action_description, created_at
FROM admin_dashboard.recent_activity
WHERE action_description LIKE 'Test%'
ORDER BY created_at DESC;
```

**Resultado esperado:**
```
 action_description    | created_at
-----------------------+-------------------------
 Test recent activity  | 2025-11-19 ...
(1 row)
```

**Criterios de éxito:**
- ✅ Solo aparece actividad reciente (5 días)
- ✅ NO aparece actividad vieja (35 días)

---

### Test 5: Join con Profiles y Users

**Objetivo:** Verificar que los joins funcionan correctamente

**Comando:**
```sql
SELECT
  ra.user_name,
  ra.email,
  ra.user_avatar,
  p.full_name AS profile_name,
  u.email AS user_email
FROM admin_dashboard.recent_activity ra
  LEFT JOIN auth_management.profiles p ON ra.user_id = p.id
  LEFT JOIN auth.users u ON p.user_id = u.id
LIMIT 5;
```

**Criterios de éxito:**
- ✅ `user_name` = `profile_name` (deben coincidir)
- ✅ `email` = `user_email` (deben coincidir)
- ✅ `user_avatar` tiene valor o NULL

**Resultado esperado:**
```
 user_name | email | user_avatar | profile_name | user_email
-----------+-------+-------------+--------------+------------
 Juan Pérez | juan@... | https://... | Juan Pérez | juan@...
```

---

### Test 6: Backend Endpoint

**Objetivo:** Verificar que el endpoint API funciona

**Setup:**
```bash
# Iniciar backend
cd apps/backend
npm run dev

# En otra terminal, obtener token admin
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gamilit.com","password":"admin123"}' \
  | jq -r '.data.accessToken')
```

**Comando:**
```bash
curl -X GET http://localhost:3000/api/admin/actions/recent \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "userId": "uuid-456",
      "userName": "Juan Pérez",
      "userAvatar": "https://...",
      "action": "Created organization",
      "actionType": "button_click",
      "timestamp": "2025-11-24T10:30:00Z",
      "details": {
        "organization_name": "Escuela XYZ"
      }
    }
  ],
  "message": "Recent actions retrieved successfully"
}
```

**Criterios de éxito:**
- ✅ Status 200 OK
- ✅ `success: true`
- ✅ Array de acciones (puede estar vacío)
- ✅ Campos en camelCase (backend debe transformar)
- ✅ NO hay error 500 "relation does not exist"

---

### Test 7: Portal Admin UI

**Objetivo:** Verificar que la UI muestra los datos

**Pasos:**
1. Abrir http://localhost:5173 (o puerto del frontend)
2. Login como admin@gamilit.com
3. Navegar a Dashboard
4. Scroll hasta sección "Acciones Recientes"

**Criterios de éxito:**
- ✅ Sección NO muestra "No hay acciones recientes"
- ✅ Se renderizan cards de acciones
- ✅ Avatares de usuarios se muestran
- ✅ Timestamps están formateados (ej: "hace 2 horas")
- ✅ Descripción de acción es legible

**Screenshot esperado:**
```
┌─────────────────────────────────────────┐
│ Acciones Recientes                      │
├─────────────────────────────────────────┤
│ [👤 Avatar] Juan Pérez                  │
│             Created organization        │
│             hace 2 horas                │
├─────────────────────────────────────────┤
│ [👤 Avatar] María García                │
│             Uploaded content            │
│             hace 5 horas                │
└─────────────────────────────────────────┘
```

---

## 🐛 POSIBLES ERRORES Y SOLUCIONES

### Error 1: "relation audit_logging.activity_log does not exist"

**Causa:** DDL no fue actualizado o recreación no ejecutó el nuevo DDL

**Solución:**
```bash
# Verificar que DDL tiene la tabla correcta
grep "user_activity_logs" apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql

# Si aparece, ejecutar recreación completa
./drop-and-recreate-database.sh $DATABASE_URL
```

---

### Error 2: "column activity_type does not exist"

**Causa:** Vista busca columna con nombre incorrecto

**Solución:**
```bash
# Verificar nombres de columnas en tabla
psql $DATABASE_URL -c "\d audit_logging.user_activity_logs"

# Si DDL está correcto pero vista no, ejecutar migration
psql $DATABASE_URL -f scripts/migrations/DB-131-fix-recent-activity-view.sql
```

---

### Error 3: Vista retorna 0 rows (pero no hay error)

**Causa:** No hay datos en `user_activity_logs` dentro de últimos 30 días

**Solución:** **NO ES UN ERROR** - esto es válido si:
- Es una instalación nueva
- No hay actividad registrada
- Datos de testing son muy antiguos

**Para generar datos de prueba:**
```sql
INSERT INTO audit_logging.user_activity_logs (
  user_id, activity_type, action_detail
) VALUES (
  (SELECT id FROM auth_management.profiles WHERE role = 'admin' LIMIT 1),
  'page_view',
  'Visited admin dashboard'
);
```

---

### Error 4: Backend retorna 500 "Cannot read property of null"

**Causa:** Vista retorna datos pero backend espera estructura diferente

**Solución:**
```typescript
// Verificar DTO en backend
// apps/backend/src/modules/admin/dto/dashboard/recent-actions.dto.ts

// Debe coincidir con columnas de vista:
export class RecentActionDto {
  id: string;
  userId: string;        // user_id (snake_case en DB)
  userName: string;      // user_name (snake_case en DB)
  userAvatar?: string;   // user_avatar (snake_case en DB)
  action: string;        // action_description (snake_case en DB)
  actionType: string;    // action_type (snake_case en DB)
  timestamp: string;     // timestamp (ya es igual)
  details?: any;         // details (ya es igual)
}
```

---

## 📊 MATRIZ DE VALIDACIÓN

| Test | Descripción | Estado | Bloqueante |
|------|-------------|--------|------------|
| **T1** | Recreación completa BD | ⏳ Pendiente | ✅ Sí |
| **T2** | Query básica SELECT | ⏳ Pendiente | ✅ Sí |
| **T3** | Estructura columnas | ⏳ Pendiente | ✅ Sí |
| **T4** | Filtro 30 días | ⏳ Pendiente | ⚠️ No |
| **T5** | Joins correctos | ⏳ Pendiente | ⚠️ No |
| **T6** | Backend endpoint | ⏳ Pendiente | ✅ Sí |
| **T7** | Portal Admin UI | ⏳ Pendiente | ✅ Sí |

**Tests bloqueantes:** Deben pasar para marcar CORR-005 como completado
**Tests no bloqueantes:** Nice-to-have, pero no críticos

---

## ✅ CRITERIOS DE ACEPTACIÓN FINALES

### Mínimo Viable (MUST HAVE)

- [ ] T1: Recreación completa ejecuta sin errores
- [ ] T2: Vista retorna datos o array vacío (NO error)
- [ ] T3: Vista tiene 11 columnas correctas
- [ ] T6: Backend endpoint retorna 200 OK
- [ ] T7: Portal Admin NO muestra error en sección

### Deseable (NICE TO HAVE)

- [ ] T4: Filtro de 30 días funciona correctamente
- [ ] T5: Joins retornan datos consistentes
- [ ] Performance: Query ejecuta en < 100ms
- [ ] Datos de prueba generados para demo

---

## 📝 INSTRUCCIONES PARA VALIDADOR

**Si eres el siguiente agente/persona validando esta corrección:**

1. **Tener acceso a BD:**
   ```bash
   export DATABASE_URL="postgresql://user:pass@host:port/dbname"
   psql $DATABASE_URL -c "SELECT version();"  # Verificar conexión
   ```

2. **Ejecutar recreación completa:**
   ```bash
   cd apps/database
   ./drop-and-recreate-database.sh $DATABASE_URL
   ```

3. **Ejecutar tests SQL (T2, T3, T4, T5):**
   Copiar y pegar queries de arriba en `psql`

4. **Iniciar backend y ejecutar test de endpoint (T6):**
   ```bash
   cd apps/backend
   npm run dev
   # En otra terminal: ejecutar curl del T6
   ```

5. **Abrir Portal Admin y verificar UI (T7):**
   ```bash
   cd apps/frontend
   npm run dev
   # Abrir navegador: http://localhost:5173
   ```

6. **Marcar tests como completados:**
   - Reemplazar `[ ]` por `[x]` en los tests que pasen
   - Agregar screenshots o logs si es necesario
   - Si hay fallos, documentar en sección de errores

7. **Actualizar estado final:**
   - Si TODOS los tests bloqueantes pasan → Estado: ✅ COMPLETADO
   - Si algún test bloqueante falla → Estado: ❌ FALLIDO (documentar fix)

---

## 🎯 ESTADO ACTUAL

**Estado general:** ⏳ PENDIENTE DE VALIDACIÓN EN AMBIENTE REAL

**Razón:** No hay acceso a base de datos en este momento

**Implementación:** ✅ 100% COMPLETADA
- DDL actualizado
- Migration creado
- Documentación completa
- Sintaxis SQL validada

**Validación funcional:** ⏳ 0% COMPLETADA
- Requiere acceso a BD
- Requiere backend corriendo
- Requiere frontend corriendo

**Próximo paso:** Ejecutar tests T1-T7 en ambiente con BD operativa

---

## 📚 REFERENCIAS

- **DDL corregido:** `apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql`
- **Migration:** `apps/database/scripts/migrations/DB-131-fix-recent-activity-view.sql`
- **Análisis:** `01-ANALISIS.md`
- **Plan:** `02-PLAN.md`
- **Ejecución:** `03-EJECUCION.md`

---

**Fecha de última actualización:** 2025-11-24
**Validador asignado:** (Pendiente)
**Estado:** ⏳ PENDIENTE DE VALIDACIÓN
