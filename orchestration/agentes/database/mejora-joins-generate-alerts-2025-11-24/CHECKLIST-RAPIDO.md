# CHECKLIST RÁPIDO: Validación de Corrección de JOINs

**Fecha:** 2025-11-24
**Agente:** Database-Agent

---

## PASO 1: VERIFICAR CAMBIOS EN EL CÓDIGO

### Archivo modificado
```bash
# Ver archivo modificado
cat apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql
```

### Verificaciones rápidas
```bash
# 1. NO debe haber JOINs a auth.users (esperado: sin resultado)
grep "JOIN auth\.users" apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql

# 2. Debe haber 3 JOINs a auth_management.profiles
grep "JOIN auth_management\.profiles" apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql

# 3. Debe haber 3 ocurrencias de p.user_id
grep "p\.user_id" apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql

# 4. Debe haber 3 ocurrencias de p.tenant_id
grep "p\.tenant_id" apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql
```

**Resultado esperado:**
- ✅ 0 JOINs a `auth.users`
- ✅ 3 JOINs a `auth_management.profiles`
- ✅ 3 usos de `p.user_id`
- ✅ 3 usos de `p.tenant_id`

---

## PASO 2: VALIDAR EN BASE DE DATOS

### Prerequisitos
- Base de datos PostgreSQL corriendo
- Acceso como `gamilit_user`
- Base de datos `gamilit_db` creada

### Ejecutar validación completa
```bash
psql -h localhost -U gamilit_user -d gamilit_db \
  -f apps/database/scripts/validate-generate-alerts-joins.sql
```

**Qué hace este script:**
1. Verifica que la función existe
2. Valida Foreign Keys relevantes
3. Recrea la función con los cambios
4. Verifica la definición de la función
5. Analiza datos existentes
6. Muestra resumen de validación

**Tiempo estimado:** 30 segundos

---

## PASO 3: TESTING FUNCIONAL (OPCIONAL)

### Si hay datos de prueba
```sql
-- Conectar a la base de datos
psql -h localhost -U gamilit_user -d gamilit_db

-- Ejecutar la función
SELECT progress_tracking.generate_student_alerts();

-- Ver alertas generadas
SELECT
  alert_type,
  COUNT(*) as total,
  COUNT(DISTINCT student_id) as unique_students,
  MIN(generated_at) as first_alert,
  MAX(generated_at) as last_alert
FROM progress_tracking.student_intervention_alerts
WHERE generated_at > NOW() - INTERVAL '1 hour'
GROUP BY alert_type
ORDER BY alert_type;

-- Ver detalles de una alerta específica
SELECT *
FROM progress_tracking.student_intervention_alerts
WHERE generated_at > NOW() - INTERVAL '1 hour'
LIMIT 5;
```

---

## PASO 4: LEER DOCUMENTACIÓN

### Lectura rápida (5 minutos)
1. `RESUMEN-EJECUTIVO.md` - Vista general
2. `DIAGRAMA-JOINS-ANTES-DESPUES.md` - Visualización del cambio

### Lectura completa (15 minutos)
3. `REPORTE-MEJORA-JOINS-ARQUITECTONICOS.md` - Análisis detallado
4. `INDEX.md` - Índice completo de la documentación

---

## CRITERIOS DE ACEPTACIÓN

Marcar cada criterio al verificarlo:

- [ ] JOINs usan `auth_management.profiles` (3 veces)
- [ ] NO hay JOINs a `auth.users` (0 veces)
- [ ] `student_id` usa `p.user_id` (3 veces)
- [ ] `tenant_id` usa `p.tenant_id` (3 veces)
- [ ] Script de validación ejecutado sin errores
- [ ] Función se crea correctamente en la BD
- [ ] (Opcional) Función genera alertas correctamente

---

## SOLUCIÓN A PROBLEMAS COMUNES

### Problema: "database does not exist"
```bash
# Crear la base de datos
./apps/database/scripts/init-database.sh
```

### Problema: "permission denied"
```bash
# Verificar usuario y permisos
psql -h localhost -U postgres -c "\du gamilit_user"
```

### Problema: "syntax error near line X"
```bash
# Verificar que el archivo no está corrupto
cat apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql | wc -l
# Debe mostrar: 199 líneas
```

---

## ROLLBACK (Si es necesario)

Si necesitas revertir los cambios, NO lo hagas manualmente. Los JOINs antiguos eran arquitectónicamente incorrectos. En su lugar:

1. Reporta el problema encontrado
2. Revisa los logs de error
3. Consulta con Database-Agent

**IMPORTANTE:** La corrección es arquitectónicamente correcta. Los JOINs antiguos funcionaban solo por coincidencia de datos.

---

## CONTACTO

**Agente responsable:** Database-Agent
**Fecha de implementación:** 2025-11-24
**Archivos modificados:** 1 función SQL
**Documentación generada:** 5 archivos

**Ubicación de documentación:**
```
orchestration/agentes/database/mejora-joins-generate-alerts-2025-11-24/
├── CHECKLIST-RAPIDO.md (este archivo)
├── DIAGRAMA-JOINS-ANTES-DESPUES.md
├── INDEX.md
├── REPORTE-MEJORA-JOINS-ARQUITECTONICOS.md
└── RESUMEN-EJECUTIVO.md
```

**Script de validación:**
```
apps/database/scripts/validate-generate-alerts-joins.sql
```

---

## ESTADO

**Implementación:** ✅ COMPLETADA
**Validación estática:** ✅ COMPLETADA
**Validación en BD:** ⏸️ PENDIENTE (requiere BD disponible)
**Testing funcional:** ⏸️ OPCIONAL (requiere datos de prueba)

---

**Database-Agent | 2025-11-24**
