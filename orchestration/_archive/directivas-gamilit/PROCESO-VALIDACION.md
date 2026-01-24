# Proceso de Validación contra Documentación

**Fecha:** 2025-11-02
**Propósito:** Definir proceso de validación contra documentación del proyecto
**Aplicable a:** Todos los agentes NEXUS-* (especialmente NEXUS-INTEGRATION)

---

## 🎯 Principio

**Toda implementación debe validarse contra la documentación del proyecto.**

---

## 📍 Documentación del Proyecto

```
/docs/
├── 01-fase-alcance-inicial/          # Casos de uso, historias de usuario
│   ├── casos-uso/
│   ├── gamificacion/
│   └── modulos/
├── 90-transversal/ # APIs, tipos, arquitectura
│   ├── apis/
│   ├── tipos-compartidos/
│   └── arquitectura/
└── 95-guias-desarrollo/               # Referencias a /apps/
```

---

## 🔄 Proceso de Validación (3 Momentos)

### 1. ANTES de Implementar (Fase de Análisis)

**Leer:**
- `/docs/01-fase-alcance-inicial/casos-uso/UC-*.md` (caso de uso relevante)
- `/docs/01-fase-alcance-inicial/modulos/*.md` (especificación del módulo)

**Validar:**
- [ ] Entendimiento completo del requisito
- [ ] Identificación de todos los criterios de aceptación
- [ ] Detección de dependencias con otros requisitos

**Output:**
- `orchestration/01-analisis/features/YYYY-MM-DD-{nombre}.md`

---

### 2. DURANTE Implementación (Fase de Ejecución)

**Leer:**
- `/docs/90-transversal/apis/*.md` (contratos de API)
- `/docs/90-transversal/tipos-compartidos/*.ts` (tipos TypeScript)

**Validar:**
- [ ] Implementación sigue especificación de API
- [ ] Tipos coinciden con tipos compartidos
- [ ] Nombres de endpoints/métodos son correctos

---

### 3. DESPUÉS de Implementar (Fase de Validación)

**Ejecutar:**
- Tests automáticos (unit, integration, E2E)
- Build (verificar que compila)
- Lint (verificar estándares)

**Validar:**
- [ ] Todos los requisitos implementados
- [ ] No hay funcionalidad no especificada
- [ ] Tests cubren casos de uso
- [ ] Coverage ≥60%

**Solicitar validación 3 capas a NEXUS-INTEGRATION:**
- Actualizar `orchestration/PROXIMA-ACCION.md` con solicitud de validación

**Output:**
- `orchestration/05-validaciones/{tipo}/YYYY-MM-DD-validation-{nombre}.md`

---

## 📊 Template de Reporte de Validación

```markdown
# Validación: {Feature/Bug Name}

**Fecha:** YYYY-MM-DD
**Agente:** NEXUS-{PERFIL}
**Requisito origen:** /docs/01-fase-alcance-inicial/casos-uso/UC-*.md

---

## Validación vs Requerimientos

### Requisitos Funcionales

- [ ] RF-001: {Descripción} → ✅ Implementado / ⚠️ Parcial / ❌ Faltante
- [ ] RF-002: {Descripción} → ...

### Requisitos No Funcionales

- [ ] RNF-001: {Descripción} → ...

---

## Validación vs Especificaciones

### API Endpoints

- [ ] POST /api/users → ✅ Coincide con especificación
- [ ] GET /api/users/:id → ...

### Tipos

- [ ] User DTO → ✅ Coincide con tipo compartido
- [ ] CreateUserRequest → ...

---

## Discrepancias Encontradas

### Discrepancia 1
**Descripción:** ...
**Gravedad:** Alta / Media / Baja
**Acción requerida:** ...

---

## Tests

- [ ] Tests unitarios: ✅ Pasando (coverage 65%)
- [ ] Tests integración: ✅ Pasando
- [ ] Tests E2E: ⚠️ Faltante (implementar)

---

## Conclusión

**Estado:** ✅ Aprobado / ⚠️ Aprobado con observaciones / ❌ Rechazado

**Observaciones:** ...

**Próximos pasos:** ...
```

---

**Creado:** 2025-11-02
**Autor:** Sistema NEXUS
**Ver también:** DIRECTIVAS-PRINCIPALES.md (DV-001 a DV-004)
