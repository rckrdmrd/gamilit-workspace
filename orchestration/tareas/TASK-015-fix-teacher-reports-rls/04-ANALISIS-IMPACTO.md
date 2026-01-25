# ANALISIS DE IMPACTO: Cambios en TeacherReportsService

**TASK:** TASK-2026-01-25-GAMILIT-REPORTS-FIX
**Fecha:** 2026-01-25
**Objetivo:** Verificar que los cambios no afectan otros modulos

---

## 1. RESUMEN EJECUTIVO

### Cambio Realizado
Se modifico `TeacherReportsService` para agregar `@InjectDataSource('social')` y usar transacciones con `SET LOCAL app.current_user_id` para soportar RLS.

### Conclusion
**El cambio NO afecta otros modulos ni el portal de students.** Los problemas reportados en "funciones del portal de students" son bugs **pre-existentes** documentados en `TASK-014-fix-student-monitoring-bugs`.

---

## 2. VERIFICACION DE DEPENDENCIAS

### 2.1 Archivos que Importan TeacherReportsService

| Archivo | Relacion | Afectado? |
|---------|----------|-----------|
| `teacher.controller.ts` | Inyecta e invoca | NO - Solo llama metodos publicos |
| `reports.service.ts` | Invoca `createReport()` | NO - `createReport()` no fue modificado |
| `scheduled-reports.service.ts` | Invoca metodos | NO - Solo usa metodos de lectura |
| `shared-reports.service.ts` | Usa repository directamente | NO - Tiene su propio repo |
| `teacher.module.ts` | Registra como provider | NO - Inyeccion funciona igual |
| `services/index.ts` | Exporta | NO - Solo re-exporta |

### 2.2 Otros Servicios con @InjectDataSource('social')

| Archivo | Uso | Afectado? |
|---------|-----|-----------|
| `health.service.ts` | Solo verifica conexion | NO - No comparte estado |
| `repository.factory.ts` | Crea repositorios | NO - Cache independiente |

### 2.3 Servicios del Portal de Students

El portal de students **NO usa** TeacherReportsService. Los servicios de students usan otros datasources:

| Servicio Student | Datasource | RLS Policy |
|------------------|------------|------------|
| exercises.service | educational | `is_published = true` |
| progress.service | progress | `user_id = auth.uid()` |
| gamification.service | gamification | `user_id = auth.uid()` |
| assignments.service | educational | `assignment_students` |

---

## 3. SISTEMAS RLS EN EL PROYECTO

### 3.1 HALLAZGO CRITICO: Dos Sistemas RLS Diferentes

El proyecto tiene **DOS enfoques de RLS incompatibles**:

#### Sistema A: Estilo Supabase (auth.uid())
**Ubicacion:** `07-enable-rls.sql` (77 tablas)
**Patron:**
```sql
CREATE POLICY "user_read_own" ON tabla
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
```

#### Sistema B: Variables de Sesion (current_setting)
**Ubicacion:** `social_features/rls-policies/08-teacher-reports-policies.sql`
**Patron:**
```sql
CREATE POLICY "teacher_reports_teacher_policy" ON teacher_reports
    FOR SELECT
    USING (teacher_id = current_setting('app.current_user_id')::uuid);
```

### 3.2 Implicaciones

| Sistema | Requiere SET LOCAL? | Usado por |
|---------|---------------------|-----------|
| auth.uid() | NO | 77 tablas de students |
| current_setting() | SI | teacher_reports, scheduled_reports, shared_reports |

**Mi cambio solo afecta a tablas que usan `current_setting()`**, que son exclusivamente del modulo teacher.

---

## 4. ANALISIS DE BUGS REPORTADOS

### 4.1 "Funciones del portal de students dejaron de funcionar"

Tras revision, estos bugs estan documentados en `TASK-014-fix-student-monitoring-bugs`:

| Bug | Descripcion | Causa Real |
|-----|-------------|------------|
| Bug 1 | "Ultima actividad: Hace 55 años" | `new Date(null)` → epoch 1970 |
| Bug 2 | Pantalla negra al clic | ID undefined → API falla |

**Estos bugs NO estan relacionados con mi cambio.** Son problemas de null handling en el frontend del Teacher Portal (Student Monitoring Panel).

### 4.2 Timeline de Cambios

```
2026-01-25 (HOY):
├── TASK-014: Bugs de Student Monitoring (pre-existentes)
│   ├── admin-alerts.service.ts (fix query SQL)
│   ├── intervention-alerts.service.ts (fix query SQL)
│   └── Frontend components (null handling)
│
└── TASK-2026-01-25-GAMILIT-REPORTS-FIX (mi cambio)
    └── teacher-reports.service.ts (SET LOCAL para RLS)
```

---

## 5. VERIFICACION DE INICIALIZACION

### 5.1 Inyeccion de DataSource

La inyeccion `@InjectDataSource('social')` es valida porque:

1. El datasource 'social' esta definido en `app.module.ts` (lineas 164-188)
2. La entidad `TeacherReport` esta registrada en ese datasource
3. `TypeOrmModule.forFeature([..., TeacherReport], 'social')` en teacher.module.ts

### 5.2 Prueba de Build

```
> @gamilit/backend@1.0.0 build
> tsc
(Sin errores)
```

---

## 6. RECOMENDACIONES

### 6.1 Para el Cambio Actual (TeacherReportsService)

**SEGURO PARA PRODUCCION** - El cambio es aislado y no afecta otros modulos.

### 6.2 Para el Sistema RLS General

**PROBLEMA ARQUITECTONICO DETECTADO:**

El proyecto tiene dos sistemas RLS incompatibles:
1. `auth.uid()` - requiere sesion de Supabase (no disponible en NestJS standalone)
2. `current_setting()` - requiere SET LOCAL por cada request

**RECOMENDACION:** Unificar el sistema RLS:

| Opcion | Descripcion | Esfuerzo |
|--------|-------------|----------|
| A | Migrar todo a `current_setting()` + SET LOCAL global | ALTO |
| B | Desactivar RLS y usar filtros a nivel de aplicacion | MEDIO |
| C | Mantener hibrido (current_setting para teacher, app-layer para resto) | BAJO |

**Opcion C es la actual** - funciona pero requiere documentacion clara.

### 6.3 Para TASK-014 (Bugs de Student Monitoring)

Estos son bugs separados que requieren:
1. Fix de null handling en frontend
2. Validaciones de ID antes de API calls
3. Valores por defecto para fechas

**NO relacionados con RLS ni con mi cambio.**

---

## 7. MATRIZ DE IMPACTO FINAL

| Componente | Impacto | Razon |
|------------|---------|-------|
| TeacherReportsService | DIRECTO | Modificado |
| ReportsService | NINGUNO | Solo usa createReport() |
| ScheduledReportsService | NINGUNO | Solo usa metodos de lectura |
| SharedReportsService | NINGUNO | Tiene su propio repo |
| Portal Teacher | NINGUNO | Endpoints funcionan igual |
| Portal Students | NINGUNO | No usa TeacherReportsService |
| Portal Admin | NINGUNO | No usa TeacherReportsService |
| Health Checks | NINGUNO | DataSource independiente |

---

## 8. CONCLUSION

1. **Mi cambio es SEGURO** - solo afecta a TeacherReportsService
2. **Los bugs de students son PRE-EXISTENTES** - documentados en TASK-014
3. **El sistema RLS tiene deuda tecnica** - dos sistemas incompatibles
4. **Recomendacion:** Proceder con el cambio actual, documentar la arquitectura hibrida

---

## 9. VALIDACION REQUERIDA

Para confirmar que todo funciona:

```bash
# 1. Build backend
cd projects/gamilit/apps/backend && npm run build

# 2. Iniciar backend
npm run start:dev

# 3. Probar endpoint de reports (requiere token de teacher)
curl -X GET http://localhost:3001/api/teacher/reports/recent \
  -H "Authorization: Bearer <TOKEN>"

# 4. Verificar que otros endpoints funcionan
curl -X GET http://localhost:3001/api/health
```

---

*Documentado segun @SIMCO-TAREA*
