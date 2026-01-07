# LECCIONES APRENDIDAS - GAMILIT

**Sistema:** SIMCO - NEXUS v4.0
**Proyecto:** GAMILIT
**Última Actualización:** 2026-01-04

---

## Auditoría 2026-01-04

### 1. Política de Carga Limpia

**Lección:** La carpeta `migrations/` viola la política de carga limpia del proyecto.

```yaml
categoria: proceso
descripcion: |
  Se creó una carpeta migrations/ para sincronizar ENUMs, cuando la política
  del proyecto establece que todos los cambios DDL deben integrarse directamente
  en los archivos base (00-prerequisites.sql, etc.).
accion_futura: |
  NUNCA crear carpeta migrations/. Los cambios de ENUM deben:
  1. Integrarse directamente en el archivo DDL correspondiente
  2. Ejecutar drop-and-recreate-database.sh para validar
  3. Sincronizar con Backend mediante scripts de validación
impacto: ALTO
```

### 2. Duplicación de Documentación

**Lección:** Archivos duplicados en docs/ causan riesgo de desincronización.

```yaml
categoria: documentacion
descripcion: |
  Se encontraron archivos idénticos en múltiples ubicaciones:
  - DATOS-GAMIFICACION.md en 00-vision-general/ y 90-transversal/
  - DocumentoDeDiseño en 00-vision-general/ y SSOT/
accion_futura: |
  ANTES de crear un documento, buscar si ya existe:
  - grep -r "nombre-archivo" docs/
  - Si existe, referenciar en lugar de duplicar
  - Mantener fuente única de verdad (SSOT)
impacto: MEDIO
```

### 3. Prefijos de API en Controllers

**Lección:** No duplicar prefijos de ruta que ya están definidos globalmente.

```yaml
categoria: tecnico
descripcion: |
  El controller media-upload.controller.ts tenía @Controller('api/v1/educational/media')
  cuando main.ts ya define el prefijo global 'api/v1'.
  Resultado: Rutas accesibles en /api/v1/api/v1/educational/media
accion_futura: |
  Al crear controllers:
  1. Verificar setGlobalPrefix() en main.ts
  2. Usar solo la ruta relativa al módulo
  3. Ejemplo: @Controller('educational/media') no @Controller('api/v1/educational/media')
impacto: ALTO
```

### 4. Archivos en Raíz del Proyecto

**Lección:** Los archivos .md deben estar en sus ubicaciones correctas, no en la raíz.

```yaml
categoria: estructura
descripcion: |
  Se encontraron 10 archivos .md en la raíz del proyecto que deberían
  estar en docs/ u orchestration/:
  - Reportes → orchestration/reportes/
  - Guías → docs/95-guias-desarrollo/
  - Prompts → orchestration/prompts/
  - Estados → orchestration/estados/
accion_futura: |
  Al crear nuevos archivos .md:
  1. NUNCA crear en raíz (excepto README.md, CHANGELOG.md, CONTRIBUTING.md)
  2. Reportes → orchestration/reportes/
  3. Documentación → docs/{fase-correspondiente}/
  4. Configuración agentes → orchestration/
impacto: MEDIO
```

### 5. Sprint Backlog Inactivo

**Lección:** El sistema SCRUM debe estar activo, no solo estructurado.

```yaml
categoria: proceso
descripcion: |
  El archivo SPRINT-ACTUAL.yml existía con estructura correcta pero
  sprint.numero=0 y historias=[]. El sistema estaba configurado pero no activo.
accion_futura: |
  Al iniciar trabajo en el proyecto:
  1. Verificar que SPRINT-ACTUAL.yml tiene sprint activo
  2. Si número=0, crear nuevo sprint con HUs relevantes
  3. Actualizar PROXIMA-ACCION.md con estado real
impacto: MEDIO
```

### 6. Nomenclatura de Carpetas

**Lección:** Las carpetas deben usar minúsculas según estándares SIMCO.

```yaml
categoria: estructura
descripcion: |
  Carpetas con nombres en MAYÚSCULAS (SSOT/, ERRORES-COMUNES/) violan
  el estándar de nomenclatura que requiere formato XX-nombre/ o nombre-descriptivo/.
accion_futura: |
  Al crear carpetas:
  1. Usar formato XX-nombre/ para carpetas principales de docs/
  2. Usar minúsculas-con-guiones para subcarpetas
  3. NUNCA usar MAYÚSCULAS completas para nombres de carpetas
impacto: BAJO
```

---

## Patrones Identificados

### Positivos (Mantener)

- Inventarios detallados y completos (DATABASE, BACKEND, FRONTEND)
- Trazas extensas de tareas (20,000+ líneas)
- HUs formales con formato SCRUM correcto
- Scripts de recreación de BD funcionales
- Estructura de docs/ organizada por fases

### Negativos (Evitar)

- Crear carpeta migrations/ en lugar de modificar DDL base
- Duplicar documentos en múltiples ubicaciones
- Dejar archivos temporales en raíz del proyecto
- Mantener Sprint Backlog vacío
- Usar MAYÚSCULAS en nombres de carpetas

---

## Métricas de Auditoría

| Antes | Después | Mejora |
|-------|---------|--------|
| 78% docs | 85% docs | +7% |
| 68% SCRUM | 90% SCRUM | +22% |
| NO CUMPLE BD | CUMPLE BD | +100% |
| 81% global | 88% global | +7% |

---

*Documento generado durante auditoría 2026-01-04 - Sistema NEXUS v4.0*
