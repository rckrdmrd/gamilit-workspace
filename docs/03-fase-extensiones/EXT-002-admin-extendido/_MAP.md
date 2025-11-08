# _MAP: EXT-002 - Admin Extendido

**Épica:** EXT-002
**Nombre:** Gestión Avanzada Admin (Admin Extendido)
**Fase:** 3 - Extensiones (Alcance v2 CORE)
**Presupuesto:** $25,200 MXN
**Story Points:** 63 SP
**Estado:** ✅ Completado 100%
**Última actualización:** 2025-11-08

**NOTA:** Añadidas US-AE-005 (Parametrización Gamificación, 12 SP) y US-AE-007 (Asignar Grupos a Maestros, 6 SP). Total añadido: 18 SP

---

## 📋 Propósito

Extender las capacidades administrativas del sistema con herramientas avanzadas de gestión masiva de usuarios, configuración de sistema, analytics agregados y moderación de contenido.

**Impacto:** **ALTO** - Administración eficiente a escala

---

## 📁 Contenido

### Historias de Usuario (12+)

**Funcionalidades Originales (~10 US, 45 SP):**
- Gestión masiva de usuarios
- Configuración de sistema (feature flags, settings)
- Analytics agregados
- Moderación de contenido
- Auditoría y logging

**Nuevas Funcionalidades v2 CORE (2 US, 18 SP):**

| Historia | Título | SP | Estado | Archivo |
|----------|--------|----|--------|---------|
| **[US-AE-005](./historias-usuario/US-AE-005-parametrizacion-gamificacion.md)** | Parametrización Dinámica de Gamificación | 12 | 📝 Especificado | [Ver spec](/tmp/US-AE-005-parametrizacion-gamificacion.md) |
| **[US-AE-007](./historias-usuario/US-AE-007-asignar-grupos-maestros.md)** | Asignar Grupos a Maestros | 6 | 📝 Especificado | [Ver spec](/tmp/US-AE-007-asignar-grupos-maestros.md) |

**Total:** ~12 US completadas + 2 especificadas = 63 SP

### Archivos de Épica

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| [README.md](./README.md) | Documentación | Overview de la épica |
| [historias-usuario/](./historias-usuario/) | User Stories | ~12 historias de usuario |
| [implementacion/TRACEABILITY.yml](./implementacion/TRACEABILITY.yml) | Trazabilidad | Mapeo código-documentación |

---

## 🎯 Módulos Funcionales

### 1. Gestión Masiva de Usuarios
- Bulk user creation/update/delete
- Import/export CSV
- Role assignment masivo
- User activation/deactivation

### 2. Configuración de Sistema
- Feature flags management
- System settings (límites, timeouts, etc.)
- Email templates configuration
- Maintenance mode

### 3. Analytics Agregados
- System-wide metrics
- User engagement analytics
- Performance dashboards
- Trend analysis

### 4. Moderación de Contenido
- Review queue
- Reported content management
- Auto-moderation rules
- Audit logs

---

## 🏗️ Implementación

### Backend
- **Módulo:** `apps/backend/src/modules/admin-extended/`
- **Endpoints:** ~15 endpoints
- **Servicios:** user-management, system-config, analytics, moderation

### Frontend
- **Feature:** `apps/frontend/src/features/admin-tools/`
- **Componentes:** ~12 componentes
- **Páginas:** Admin Dashboard, User Management, System Config, Analytics

### Base de Datos
- **Schema:** `admin_dashboard` (extendido)
- **Tablas modificadas:** system_configuration
- **Nuevas tablas:** content_moderation, moderation_rules

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| **User Stories** | 10 |
| **Story Points** | 45 SP |
| **Presupuesto** | $12,000 MXN |
| **Estado** | ✅ 100% |

---

## 🔗 Referencias

- **Fase:** [Fase 3: Extensiones](../)
- **Documentación original:** `docs_bkp/04-planificacion/03-extensiones/EXT-002-admin-extendido/`

---

**Generado:** 2025-11-08
**Versión:** 1.0.0
