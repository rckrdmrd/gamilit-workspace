# Archivos Grandes - Candidatos a Modularizacion

**Fecha:** 2025-12-26
**Generado por:** Requirements-Analyst
**Criterio:** Archivos > 400 lineas

---

## 1. RESUMEN

Se identificaron 15 archivos de documentacion que exceden 400 lineas y son candidatos a modularizacion o archivado.

| Prioridad | Cantidad | Accion Sugerida |
|-----------|----------|-----------------|
| Alta | 3 | Modularizar inmediatamente |
| Media | 7 | Modularizar cuando sea conveniente |
| Baja | 5 | Archivar o mantener |

---

## 2. PRIORIDAD ALTA (Modularizar)

### 2.1 Manual_Portal_Administrador_ACTUALIZADO.md
- **Lineas:** 2,449
- **Ubicacion:** `docs/99-finiquito/`
- **Problema:** Manual monolitico dificil de mantener
- **Accion:** Dividir por secciones:
  - ADMIN-USERS.md
  - ADMIN-CLASSROOMS.md
  - ADMIN-REPORTS.md
  - ADMIN-GAMIFICATION.md

### 2.2 ET-GAM-003-rangos-maya.md
- **Lineas:** 2,442
- **Ubicacion:** `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/`
- **Problema:** Especificacion muy detallada, historica
- **Accion:** Extraer a:
  - RANGOS-MAYA-SPEC.md (especificacion activa)
  - RANGOS-MAYA-HISTORICO.md (versiones anteriores)

### 2.3 PORTAL-ADMIN-GUIDE.md
- **Lineas:** 2,213
- **Ubicacion:** `docs/95-guias-desarrollo/`
- **Problema:** Guia monolitica
- **Accion:** Dividir por feature:
  - ADMIN-GUIDE-USERS.md
  - ADMIN-GUIDE-ANALYTICS.md
  - ADMIN-GUIDE-CONFIG.md

---

## 3. PRIORIDAD MEDIA (Modularizar eventualmente)

| Archivo | Lineas | Ubicacion | Accion |
|---------|--------|-----------|--------|
| TRACKING-CORRECCIONES.md | 1,977 | inventarios-database/ | Archivar versiones antiguas |
| Manual_Portal_Student_v1.0.md | 1,859 | 99-finiquito/ | Dividir por modulo |
| PORTAL-STUDENT-GUIDE.md | 1,792 | 95-guias-desarrollo/ | Dividir por feature |
| PLAN-IMPLEMENTACION-*.md | 1,788 | EAI-008-portal-admin/ | Archivar (historico) |
| Manual_Portal_Maestros_*.md | 1,617 | 99-finiquito/ | Dividir por seccion |
| ET-GAM-001-achievements.md | 1,601 | especificaciones/ | Extraer historico |
| SPRINTS-DETALLADOS.md | 1,550 | sprints/ | Mover a archivo Sprint por Sprint |

---

## 4. PRIORIDAD BAJA (Mantener o archivar)

| Archivo | Lineas | Accion |
|---------|--------|--------|
| EJERCICIOS-PREGUNTAS-RESPUESTAS.md | 1,529 | Mantener (referencia) |
| REPORTE-COHERENCIA-*.md | 1,514 | Archivar |
| FUNCIONES-UTILITARIAS-PUBLIC.md | 1,451 | Mantener (tecnico) |
| GUIA-PRUEBAS-MODULO3-*.md | 1,449 | Mantener (testing) |
| US-AE-007-*.md | 1,414 | Archivar |

---

## 5. ESTRATEGIA DE MODULARIZACION

### 5.1 Pasos Recomendados

1. **Crear estructura de carpetas:**
   ```
   docs/
   ├── portales/
   │   ├── admin/
   │   ├── teacher/
   │   └── student/
   └── archivo/
       └── 2025-Q4/
   ```

2. **Migrar contenido activo:**
   - Extraer secciones relevantes
   - Crear archivos modulares < 500 lineas
   - Actualizar enlaces internos

3. **Archivar contenido historico:**
   - Mover a `archivo/YYYY-QN/`
   - Mantener solo para referencia

### 5.2 Criterios de Division

| Tipo de Documento | Limite Recomendado | Razon |
|-------------------|-------------------|-------|
| Manuales de Usuario | 500 lineas | Facilidad de navegacion |
| Especificaciones Tecnicas | 800 lineas | Contexto completo |
| Guias de Desarrollo | 600 lineas | Balance detalle/acceso |
| Reportes | Sin limite | Historico completo |

---

## 6. IMPACTO DE MODULARIZACION

### Beneficios
- Navegacion mas rapida
- Mantenimiento mas facil
- Git diffs mas claros
- Busqueda mas precisa

### Riesgos
- Enlaces rotos temporalmente
- Duplicacion accidental
- Perdida de contexto

### Mitigacion
- Actualizar enlaces con script
- Usar CHANGELOG por archivo
- Mantener indice central

---

## 7. PENDIENTES

| ID | Archivo | Accion | Prioridad | Esfuerzo |
|----|---------|--------|-----------|----------|
| MOD-001 | Manual_Portal_Administrador | Modularizar | Alta | 2h |
| MOD-002 | ET-GAM-003-rangos-maya | Separar historico | Alta | 1h |
| MOD-003 | PORTAL-ADMIN-GUIDE | Modularizar | Alta | 2h |
| MOD-004 | Manual_Portal_Student | Modularizar | Media | 1.5h |
| MOD-005 | TRACKING-CORRECCIONES | Archivar antiguo | Media | 30m |

---

**Estado:** DOCUMENTADO - Pendiente ejecucion

*Generado por Requirements-Analyst - GAMILIT*
