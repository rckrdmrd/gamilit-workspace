# _MAP: docs/01-requerimientos/03-contenido-educativo/

**Última actualización:** 2025-11-07
**Propósito:** Requerimientos funcionales del sistema de contenido educativo (ejercicios, mecánicas, módulos)
**Audiencia:** Product Owners, Desarrolladores, Diseñadores Instruccionales
**Estado:** 🟢 Completo

---

## 📁 Contenido de esta Carpeta

### Requerimientos Funcionales

| ID | Título | Archivo | Estado | Prioridad |
|----|--------|---------|--------|-----------|
| RF-EDU-001 | Sistema de Mecánicas de Ejercicios | [RF-EDU-001-mecanicas-ejercicios.md](./RF-EDU-001-mecanicas-ejercicios.md) | ✅ Implementado | Alta |
| RF-EDU-002 | Niveles de Dificultad Progresiva | [RF-EDU-002-niveles-dificultad.md](./RF-EDU-002-niveles-dificultad.md) | ✅ Implementado | Alta |
| RF-EDU-003 | Taxonomía de Bloom para Clasificación Cognitiva | [RF-EDU-003-taxonomia-bloom.md](./RF-EDU-003-taxonomia-bloom.md) | ✅ Implementado | Alta |

**Total requerimientos:** 3/3 (100%)

---

## 🔗 Interdependencias

### Módulos Relacionados

**Depende de:**
- [01-autenticacion-autorizacion](../01-autenticacion-autorizacion/) - Validación de acceso a contenido
- [02-gamificacion](../02-gamificacion/) - Sistema de XP, achievements por completar ejercicios
- [04-progreso-seguimiento](../04-progreso-seguimiento/) - Tracking de avance en ejercicios

**Usado por:**
- [Teacher Portal](../teacher-portal/) - Creación y asignación de ejercicios
- [Admin Portal](../admin-portal/) - Gestión de contenido educativo

### Documentación Relacionada

**Especificaciones Técnicas:**
- [ET-EDU-*](../../02-especificaciones-tecnicas/03-contenido-educativo/) - Specs técnicas de contenido educativo

**Desarrollo:**
- [Mecánicas](../../01-requerimientos/modulos/) - Documentación detallada de 27 mecánicas
- [Backend](../../03-desarrollo/backend/) - Implementación de validators y scoring

**Database:**
- Schema: `educational_content` → `apps/database/ddl/schemas/educational_content/`

---

## 📊 Métricas

- **Total documentos:** 3/3 (100%)
- **RFs completos:** 3
- **Cobertura implementación:** 100%
- **Mecánicas documentadas:** 27 (ver [modulos/](../modulos/))
- **Estado:** ✅ COMPLETO

---

## 🎯 Alcance del Módulo

### Funcionalidades Cubiertas

1. **Sistema de Mecánicas de Ejercicios (RF-EDU-001)**
   - 27 mecánicas diferentes (selección, arrastrar, ordenar, etc.)
   - Validación automática de respuestas
   - Sistema de scoring (correcto/incorrecto/parcial)
   - Hints y retroalimentación
   - Adaptabilidad por nivel de dificultad

2. **Niveles de Dificultad Progresiva (RF-EDU-002)**
   - 8 niveles basados en CEFR (A1 → Nativo)
   - Rangos de vocabulario y complejidad gramatical
   - Sistema de promoción automática
   - Placement tests para ubicación inicial
   - Zona de desarrollo próximo

3. **Taxonomía de Bloom (RF-EDU-003)**
   - 6 niveles cognitivos (Remember → Create)
   - Clasificación LOTS/MOTS/HOTS
   - Perfil cognitivo por estudiante
   - Recomendaciones basadas en niveles débiles
   - Achievements cognitivos

### Tecnologías Clave

- **Frontend:** React componentes para cada mecánica
- **Backend:** Validators para 27 tipos de mecánicas
- **Database:** JSONB para configuración flexible

---

## 🚀 Próximos Pasos

### Módulo Completo ✅
Todos los RFs planificados han sido documentados e implementados.

### Prioridad Alta
1. [x] ~~RF-EDU-001: Sistema de Mecánicas~~ ✅ Completado
2. [x] ~~RF-EDU-002: Niveles de Dificultad~~ ✅ Completado
3. [x] ~~RF-EDU-003: Taxonomía de Bloom~~ ✅ Completado

### Futuras Extensiones (Fase 2)
- [ ] RF-EDU-004: Sistema de Lecturas Extensivas
- [ ] RF-EDU-005: Editor de Contenido para Maestros
- [ ] RF-EDU-006: Banco de Ejercicios Pre-diseñados
- [ ] RF-EDU-007: Sistema de Adaptabilidad Dinámica de Dificultad

---

## ⚠️ Notas Importantes

- Las 27 mecánicas están documentadas en detalle en [modulos/](../modulos/)
- Cada mecánica tiene esquema JSON específico en `apps/database/ddl/schemas/educational_content/`
- Ver `MODULOS-EDUCATIVOS.md` para especificaciones completas de mecánicas
