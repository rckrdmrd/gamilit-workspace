# ANALISIS: Teacher Reports Page No Muestra Datos

**TASK:** TASK-2026-01-25-GAMILIT-REPORTS-FIX
**Fecha:** 2026-01-25
**Proyecto:** gamilit
**Modulo:** Teacher Portal - Reports

---

## 1. DESCRIPCION DEL PROBLEMA

La pagina de Reports en el Teacher Portal (`/teacher/reports`) no muestra ningun dato:
- Lista de reportes recientes: vacia
- Estadisticas: todas en cero
- El sistema muestra el banner "Datos de Demostracion" (fallback a mock data)

---

## 2. INVESTIGACION REALIZADA

### 2.1 Flujo de Datos Identificado

```
Frontend                    Backend                         Database
---------                   -------                         --------
TeacherReportsPage.tsx
    |
    +---> GET /teacher/reports/recent
    |         |
    |         +---> TeacherController.getRecentReports()
    |                    |
    |                    +---> TeacherReportsService.getRecentReports(teacherId)
    |                              |
    |                              +---> teacherReportRepo.find({ where: { teacherId } })
    |                                       |
    |                                       +---> PostgreSQL: SELECT * FROM social_features.teacher_reports
    |                                                WHERE teacher_id = $1  <-- RLS FILTER APPLIED
    |                                                |
    |                                                +---> RLS Policy checks:
    |                                                      teacher_id = current_setting('app.current_user_id')::uuid
    |                                                      |
    |                                                      +---> current_setting returns NULL (not set!)
    |                                                            |
    |                                                            +---> 0 rows returned
```

### 2.2 Archivos Clave Analizados

| Archivo | Linea | Hallazgo |
|---------|-------|----------|
| `rls.interceptor.ts` | 99-101 | Comentario: "Por ahora, el RLS se aplicara a nivel de servicio" |
| `rls.interceptor.ts` | 88-93 | Solo adjunta `request.rlsContext`, NO ejecuta SET LOCAL |
| `teacher-reports-policies.sql` | 29-31 | Policy requiere `current_setting('app.current_user_id')` |
| `08-teacher_reports.sql` | 84 | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |

### 2.3 Causa Raiz Identificada

**PROBLEMA:** El `RlsInterceptor` fue disenado para establecer variables de sesion PostgreSQL, pero la implementacion esta **INCOMPLETA**.

```typescript
// rls.interceptor.ts lineas 99-101
// Por ahora, el RLS se aplicará a nivel de servicio usando el contexto
// En el futuro, se puede implementar la aplicación automática de SET LOCAL
return next.handle()...
```

**IMPACTO:**
- Las policies RLS en `teacher_reports` requieren:
  ```sql
  teacher_id = current_setting('app.current_user_id', true)::uuid
  ```
- Sin `SET LOCAL app.current_user_id = 'xxx'`, `current_setting()` retorna `NULL`
- La comparacion `teacher_id = NULL` siempre es `FALSE`
- **Resultado: 0 filas retornadas**

---

## 3. ARQUITECTURA ACTUAL

### 3.1 Configuracion de Datasources

El proyecto usa **10 datasources** separados (app.module.ts):
- auth, educational, gamification, progress, **social**, content, audit, notifications, communication, admin_dashboard

`TeacherReport` esta en datasource **'social'** (lineas 159-162 de teacher.module.ts):
```typescript
TypeOrmModule.forFeature(
  [ClassroomMember, TeacherClassroom, Classroom, TeacherReport, ...],
  'social',
)
```

### 3.2 RLS Policies en teacher_reports

```sql
-- Policy 1: Teachers ven solo sus reportes
CREATE POLICY teacher_reports_teacher_policy
    ON social_features.teacher_reports
    FOR SELECT
    USING (
        teacher_id = current_setting('app.current_user_id', true)::uuid
    );

-- Policy 2: Admins ven todos en su tenant
CREATE POLICY teacher_reports_admin_policy
    ON social_features.teacher_reports
    FOR SELECT
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
        AND EXISTS (SELECT 1 FROM auth_management.user_roles ...)
    );
```

### 3.3 Obtencion del teacherId

En `TeacherController` (linea 496):
```typescript
const teacherId = req.user!.profile?.id || req.user!.id;
```

El `teacherId` se pasa al servicio pero **NUNCA se comunica a PostgreSQL** via `SET LOCAL`.

---

## 4. OPCIONES DE SOLUCION

### OPCION 1: Implementar SET LOCAL en RlsInterceptor (Global)

**Descripcion:** Completar la implementacion del RlsInterceptor para ejecutar `SET LOCAL` en cada request.

**Implementacion:**
```typescript
// rls.interceptor.ts
async intercept(context, next) {
  // ... obtener user data ...

  // Ejecutar SET LOCAL en cada datasource relevante
  for (const dsName of ['social', 'progress', ...]) {
    const ds = this.moduleRef.get(getDataSourceToken(dsName));
    await ds.query(`
      SET LOCAL app.current_user_id = '${userId}';
      SET LOCAL app.current_tenant_id = '${tenantId}';
    `);
  }

  return next.handle();
}
```

**Pros:**
- Solucion arquitectonicamente correcta
- RLS funciona automaticamente para todos los servicios
- Seguridad enforced en capa de BD

**Contras:**
- Complejidad alta por 10 datasources
- Performance overhead (SET LOCAL por cada request)
- Risk de race conditions en conexiones pooled

**Complejidad:** ALTA

---

### OPCION 2: SET LOCAL en el Servicio (Focalizado) - **RECOMENDADA**

**Descripcion:** Agregar un metodo helper en `TeacherReportsService` que ejecute `SET LOCAL` antes de las queries.

**Implementacion:**
```typescript
// teacher-reports.service.ts
@Injectable()
export class TeacherReportsService {
  constructor(
    @InjectRepository(TeacherReport, 'social')
    private readonly teacherReportRepo: Repository<TeacherReport>,
    @InjectDataSource('social')
    private readonly dataSource: DataSource,
  ) {}

  private async setRlsContext(userId: string, tenantId?: string): Promise<void> {
    await this.dataSource.query(`
      SET LOCAL app.current_user_id = $1;
      SET LOCAL app.current_tenant_id = $2;
    `, [userId, tenantId || '00000000-0000-0000-0000-000000000000']);
  }

  async getRecentReports(teacherId: string, limit: number = 10): Promise<ReportMetadataDto[]> {
    // Opcion A: Usar transaccion con SET LOCAL
    return this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.current_user_id = $1`, [teacherId]);

      const reports = await manager.find(TeacherReport, {
        where: { teacherId },
        order: { generatedAt: 'DESC' },
        take: limit,
      });

      return reports.map(this.mapToReportMetadataDto);
    });
  }
}
```

**Pros:**
- Solucion focalizada y controlada
- Menor riesgo de efectos secundarios
- Facil de probar y debuggear

**Contras:**
- Debe replicarse en cada servicio con RLS
- No es solucion "automatica"

**Complejidad:** MEDIA

---

### OPCION 3: Desactivar RLS Temporalmente

**Descripcion:** Deshabilitar RLS en la tabla `teacher_reports` hasta implementar solucion correcta.

**Implementacion:**
```sql
ALTER TABLE social_features.teacher_reports DISABLE ROW LEVEL SECURITY;
```

**Pros:**
- Solucion inmediata
- Sin cambios de codigo

**Contras:**
- **COMPROMETE SEGURIDAD** - cualquier teacher puede ver reportes de otros
- Solo workaround temporal
- Debe revertirse

**Complejidad:** BAJA (pero NO RECOMENDADA para produccion)

---

### OPCION 4: Filtrado a Nivel de Aplicacion (Bypass RLS)

**Descripcion:** El servicio ya filtra por `teacherId` en la clausula WHERE. Si el usuario de BD tiene permisos BYPASSRLS, las policies no aplican.

**Verificar:**
```sql
SELECT rolbypassrls FROM pg_roles WHERE rolname = 'gamilit_user';
```

Si `rolbypassrls = true`, las queries funcionarian sin SET LOCAL pero RLS no aplicaria.

**Pros:**
- Podria ya estar funcionando parcialmente
- El filtro de aplicacion (`where: { teacherId }`) provee seguridad basica

**Contras:**
- Depende de configuracion de rol
- No es la arquitectura disenada

---

## 5. RECOMENDACION

**OPCION 2: SET LOCAL en el Servicio** es la solucion recomendada porque:

1. **Impacto controlado:** Solo modifica el servicio afectado
2. **Facil de validar:** Puedes probar inmediatamente
3. **Reversible:** No requiere cambios de esquema
4. **Patron replicable:** Puede documentarse para otros servicios con RLS

---

## 6. PLAN DE IMPLEMENTACION DETALLADO

### Fase 1: Diagnostico Confirmatorio

```bash
# 1. Verificar RLS esta habilitado
wsl -d Ubuntu-24.04 -u developer -- psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'teacher_reports';"

# 2. Verificar policies existen
wsl -d Ubuntu-24.04 -u developer -- psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'teacher_reports';"

# 3. Probar query con SET LOCAL
wsl -d Ubuntu-24.04 -u developer -- psql -h localhost -U gamilit_user -d gamilit_platform -c "
BEGIN;
SET LOCAL app.current_user_id = '<teacher_profile_id>';
SELECT COUNT(*) FROM social_features.teacher_reports;
ROLLBACK;"
```

### Fase 2: Implementacion

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-reports.service.ts`

**Cambios requeridos:**

1. Inyectar `DataSource` para el datasource 'social'
2. Crear metodo `setRlsContext()`
3. Modificar `getRecentReports()` para usar transaccion con SET LOCAL
4. Modificar `getReportStats()` para usar transaccion con SET LOCAL
5. Modificar otros metodos que lean de la tabla

### Fase 3: Validacion

1. **Unit Test:** Verificar que SET LOCAL se ejecuta
2. **Integration Test:** Verificar endpoint retorna datos
3. **E2E Test:** Verificar UI muestra lista de reportes

---

## 7. ARCHIVOS A MODIFICAR

| Archivo | Tipo | Cambio |
|---------|------|--------|
| `teacher-reports.service.ts` | MODIFICAR | Agregar DataSource, setRlsContext(), usar transacciones |
| `teacher.module.ts` | VERIFICAR | Asegurar que DataSource de 'social' esta disponible |

---

## 8. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| SET LOCAL no se propaga en pool | Media | Alto | Usar transacciones explicitas |
| Performance degradation | Baja | Medio | Monitorear tiempos de respuesta |
| Otros servicios con mismo issue | Alta | Medio | Auditar tablas con RLS |

---

## 9. TABLAS CON RLS HABILITADO (AUDITORIA PENDIENTE)

Verificar si otras tablas tienen el mismo problema:

```sql
SELECT schemaname, tablename
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE c.relrowsecurity = true
AND t.schemaname NOT IN ('pg_catalog', 'information_schema');
```

---

## 10. REFERENCIAS

- `apps/backend/src/shared/interceptors/rls.interceptor.ts`
- `apps/backend/src/modules/teacher/services/teacher-reports.service.ts`
- `apps/database/ddl/schemas/social_features/rls-policies/08-teacher-reports-policies.sql`
- ADR-003: RLS vs App-Layer Authorization Strategy
