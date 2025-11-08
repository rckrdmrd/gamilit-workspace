# Sistema de Orquestación NEXUS

**Versión:** 1.0
**Fecha de creación:** 2025-11-04
**Estado:** ✅ OPERATIVO

---

## 📖 Visión General

Este directorio contiene el sistema de orquestación NEXUS para el proyecto GAMILIT. El agente NEXUS-INTEGRATION coordina la validación y coherencia entre las tres capas del sistema (Database ↔ Backend ↔ Frontend) y contra la documentación.

---

## 🗂️ Estructura del Sistema

```
orchestration/
├── README.md                           # Este archivo - Guía general
├── ESTADO-INTEGRATION.json             # Estado actual del agente
├── TRAZA-TAREAS-INTEGRATION.md         # Historial de tareas
├── REGISTRO-SUBAGENTES.json            # Registro de agentes NEXUS-*
├── PROXIMA-ACCION.md                   # Coordinación de próximas acciones
├── INICIALIZACION-NEXUS-INTEGRATION.md # Documento de inicialización
│
├── 01-analisis/                        # Análisis de discrepancias
│   └── [reportes de análisis]
│
├── 04-logs/                            # Logs del sistema
│   └── integration/                    # Logs de validaciones
│
└── 05-validaciones/                    # Validaciones realizadas
    ├── _MAP.md                         # Mapa de todas las validaciones
    ├── tipos/                          # Validaciones de tipos
    │   ├── README.md
    │   ├── database-backend/           # SQL → TypeScript
    │   ├── backend-frontend/           # Backend → Frontend
    │   └── cross-layer/                # Multi-capa
    ├── integracion/                    # Validaciones E2E
    │   ├── README.md
    │   ├── auth/                       # Autenticación
    │   ├── gamification/               # Gamificación
    │   ├── educational-content/        # Contenido educativo
    │   └── social-features/            # Redes sociales
    └── documentacion/                  # Validaciones vs docs
        ├── README.md
        ├── casos-uso/                  # vs UC-*
        ├── especificaciones/           # vs specs técnicas
        └── reportes/                   # Reportes de gaps
```

---

## 🎯 Agentes del Sistema NEXUS

### NEXUS-INTEGRATION (Orquestador Principal)
**Estado:** ✅ ACTIVO
**Rol:** Orquestación, validación y coordinación
**Responsabilidades:**
- Validar coherencia entre capas
- Code review automático
- Validación vs documentación
- Coordinar otros agentes NEXUS

### NEXUS-DATABASE
**Estado:** ⚪ NO INICIALIZADO
**Rol:** Especialista en capa de datos
**Áreas:** `apps/database/`

### NEXUS-BACKEND
**Estado:** ⚪ NO INICIALIZADO
**Rol:** Especialista en API y lógica de negocio
**Áreas:** `apps/backend/src/`

### NEXUS-FRONTEND
**Estado:** ⚪ NO INICIALIZADO
**Rol:** Especialista en interfaz de usuario
**Áreas:** `apps/frontend/src/`

### NEXUS-TESTING
**Estado:** ⚪ NO INICIALIZADO
**Rol:** Especialista en testing y QA
**Áreas:** Tests unitarios, integración, E2E

### NEXUS-DOCS
**Estado:** ⚪ NO INICIALIZADO
**Rol:** Especialista en documentación
**Áreas:** `docs/`

---

## 🔄 Flujo de Trabajo

### 1. Solicitar Validación

**Paso 1:** Actualizar `PROXIMA-ACCION.md` con la solicitud
```markdown
### [AGENTE-SOLICITANTE] - Feature X

**Fecha de solicitud:** 2025-11-04
**Prioridad:** Alta
**Tipo de validación:** Tipos/Integración/Documentación

**Descripción:** Qué se implementó y qué necesita validación

**Archivos modificados:**
- path/to/file1.ts
- path/to/file2.sql

**Requisitos relacionados:**
- UC-001
```

**Paso 2:** NEXUS-INTEGRATION procesa la solicitud

**Paso 3:** Se genera reporte en `05-validaciones/`

### 2. Consultar Estado

- **Estado general:** `cat ESTADO-INTEGRATION.json`
- **Validaciones:** `cat 05-validaciones/_MAP.md`
- **Próxima acción:** `cat PROXIMA-ACCION.md`
- **Historial:** `cat TRAZA-TAREAS-INTEGRATION.md`

### 3. Revisar Resultados

Los reportes se generan en:
- `05-validaciones/tipos/` - Validaciones de tipos
- `05-validaciones/integracion/` - Tests E2E
- `05-validaciones/documentacion/` - Gaps de documentación

---

## 📊 Tipos de Validación

### 1. Validación de Tipos (Database ↔ Backend ↔ Frontend)

**Objetivo:** Asegurar coherencia de tipos entre capas

**Verifica:**
- SQL types → TypeScript DTOs
- Backend DTOs → Frontend interfaces
- Enums y constantes consistentes

**Ejemplo:**
```typescript
// Database: users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

// Backend DTO debe coincidir
interface UserDTO {
  id: string;          // UUID → string ✅
  email: string;       // VARCHAR → string ✅
  createdAt: Date;     // TIMESTAMP → Date ✅
}

// Frontend interface debe coincidir
interface User {
  id: string;          // ✅
  email: string;       // ✅
  createdAt: string;   // ⚠️ Date → string (ISO 8601)
}
```

### 2. Validación de Integración (E2E)

**Objetivo:** Verificar flujos completos funcionan correctamente

**Verifica:**
- Endpoints responden correctamente
- Frontend consume APIs exitosamente
- Estados se mantienen consistentes
- Performance es aceptable

**Ejemplo de flujo:**
1. Usuario hace login (Frontend)
2. Request a `/api/auth/login` (Backend)
3. Valida credenciales en DB (Database)
4. Retorna JWT token (Backend)
5. Frontend almacena y usa token (Frontend)

### 3. Validación vs Documentación

**Objetivo:** Asegurar implementación cumple requisitos

**Verifica:**
- Casos de uso implementados
- Requisitos funcionales cubiertos
- Requisitos no funcionales cumplidos
- Sin funcionalidad no especificada

**Ejemplo:**
```markdown
UC-001: Login de Usuario

✅ RF-001: Login con email/password (implementado)
✅ RF-002: Validación de credenciales (implementado)
⚠️ RF-003: Remember me (faltante)
❌ RF-004: Recuperar contraseña (no implementado)
```

---

## 🛠️ Comandos Útiles

### Ver estructura completa
```bash
find .claude/orchestration/ -type f | sort
```

### Ver estado actual
```bash
cat .claude/orchestration/ESTADO-INTEGRATION.json | jq
```

### Ver última acción
```bash
cat .claude/orchestration/PROXIMA-ACCION.md
```

### Ver validaciones recientes
```bash
cat .claude/orchestration/05-validaciones/_MAP.md
```

### Ver registro de agentes
```bash
cat .claude/orchestration/REGISTRO-SUBAGENTES.json | jq
```

---

## 📈 Métricas y KPIs

El sistema rastrea las siguientes métricas:

- **Validaciones completadas:** Número total de validaciones
- **Discrepancias detectadas:** Issues encontrados
- **Reportes generados:** Documentos de validación
- **Coverage promedio:** Porcentaje de cobertura de tests
- **Tiempo de validación:** Tiempo promedio por validación

Ver métricas actuales en `ESTADO-INTEGRATION.json`.

---

## 🚨 Troubleshooting

### Problema: Agente no responde
**Solución:** Verificar `ESTADO-INTEGRATION.json` → `health.status`

### Problema: Validación falla sin razón
**Solución:** Revisar logs en `04-logs/integration/`

### Problema: No se generan reportes
**Solución:** Verificar permisos de escritura en `05-validaciones/`

### Problema: Discrepancias no se resuelven
**Solución:** Consultar reporte específico y seguir recomendaciones

---

## 📚 Referencias

### Documentación del Agente
- [INIT-NEXUS-INTEGRATION.md](../.claude/agents/INIT-NEXUS-INTEGRATION.md)

### Documentación del Proyecto
- [Requerimientos](/docs/01-requerimientos/)
- [Especificaciones Técnicas](/docs/02-especificaciones-tecnicas/)

### Áreas de Código
- [Database](/apps/database/)
- [Backend](/apps/backend/src/)
- [Frontend](/apps/frontend/src/)

---

## 🔐 Mejores Prácticas

1. **Siempre validar después de cambios significativos**
2. **Mantener documentación actualizada**
3. **Resolver discrepancias inmediatamente**
4. **No commitear código con validaciones fallidas**
5. **Mantener coverage ≥60%**
6. **Archivos ≤400 líneas**
7. **No commitear secrets**

---

## 🎓 Preguntas Frecuentes

**P: ¿Cuándo debo solicitar una validación?**
R: Después de implementar una feature, fix, o cambio significativo en cualquier capa.

**P: ¿Qué hago si una validación falla?**
R: Revisar el reporte generado, seguir las recomendaciones, y corregir los issues detectados.

**P: ¿Puedo saltarme las validaciones?**
R: No recomendado. Las validaciones previenen bugs y aseguran calidad.

**P: ¿Cómo inicializo otros agentes NEXUS?**
R: Consultar los archivos INIT-NEXUS-*.md en `.claude/agents/`

**P: ¿Dónde veo el historial completo?**
R: En `TRAZA-TAREAS-INTEGRATION.md`

---

## 📞 Soporte

Para issues con el sistema de orquestación:
1. Revisar este README
2. Consultar `INICIALIZACION-NEXUS-INTEGRATION.md`
3. Verificar logs en `04-logs/integration/`
4. Revisar estado en `ESTADO-INTEGRATION.json`

---

**Última actualización:** 2025-11-04
**Mantenido por:** NEXUS-INTEGRATION Agent
**Versión del sistema:** 1.0
