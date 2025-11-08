# Principios SOLID / Normalización para Documentación

**Fecha:** 2025-11-02
**Versión:** 1.0
**Aplicable a:** Toda documentación del sistema

---

## 🎯 Objetivo

Aplicar principios SOLID y normalización (como base de datos) a la documentación para:
- Evitar duplicación
- Facilitar mantenimiento
- Modularizar efectivamente
- Mantener coherencia

---

## 📋 Principios SOLID Aplicados

### 1. Single Responsibility (SRP)

**Un archivo = un propósito**

❌ **MAL:** `PLAN-Y-ANALISIS-Y-LOG.md`
✅ **BIEN:** `ANALISIS-feature.md`, `PLAN-feature.md`, `LOG-feature.md`

### 2. Open/Closed (OCP)

**Archivos abiertos para modificación Y extensión**

✅ **Modificar:** Actualizar `PLAN-CICLO-1.md` cuando se descubre nuevo micro
✅ **Extender:** Crear `PLAN-MICRO-1-5.md` para detalle del micro

**Regla:** Si el propósito/función es la misma → actualizar existente, NO crear duplicado

### 3. Liskov Substitution (LSP)

**Archivos del mismo tipo son intercambiables (misma estructura)**

Todos los `PLAN-MICRO-*.md` siguen la misma estructura
Todos los `ANALISIS-*.md` siguen el mismo template

### 4. Interface Segregation (ISP)

**Archivos específicos mejor que archivos gigantes**

❌ **MAL:** `PLAN-COMPLETO-PROYECTO.md` (5000 líneas)
✅ **BIEN:** `02-planes/ciclo-{N}/PLAN-MICRO-{X}.md` (300 líneas c/u)

### 5. Dependency Inversion (DIP)

**Referencias a abstracciones, no a implementaciones**

❌ **MAL:** "Ver línea 234 de UserService.ts"
✅ **BIEN:** "Ver `UserService.authenticate()` en apps/backend/src/auth/user.service.ts:234"

---

## 🗄️ Normalización de Documentación (como BD)

### Primera Forma Normal (1FN)

**Eliminar grupos repetitivos**

❌ **MAL:** Un archivo con análisis de 10 features
✅ **BIEN:** 10 archivos separados (1 por feature)

### Segunda Forma Normal (2FN)

**Eliminar dependencias parciales**

❌ **MAL:** `ANALISIS-BACKEND-FRONTEND.md` (mixto)
✅ **BIEN:**
- `ANALISIS-BACKEND.md`
- `ANALISIS-FRONTEND.md`
- `ANALISIS-INTEGRACION.md` (referencia a ambos)

### Tercera Forma Normal (3FN)

**Eliminar dependencias transitivas (NO duplicar)**

❌ **MAL:** Repetir descripción de feature en análisis, plan y log
✅ **BIEN:**
- `ANALISIS-feature.md` (descripción completa)
- `PLAN-feature.md` (referencia: "Ver [ANALISIS-feature.md](../01-analisis/features/ANALISIS-feature.md)")
- `LOG-feature.md` (referencia al análisis)

---

## 🔗 Principio de No-Duplicación (DRY aplicado a docs)

**Usar referencias en lugar de duplicar contenido**

### Ejemplo

```markdown
# PLAN-CICLO-5.md

## Descripción
Ver análisis completo en: [ANALISIS-2025-11-02-auth-jwt.md](../01-analisis/features/2025-11-02-auth-jwt.md)

## Resumen Ejecutivo
Implementar autenticación JWT basada en análisis previo.

## Microciclos
...
```

---

## 📦 Modularización por Carpetas

**Archivos grandes → Carpeta con múltiples archivos + _MAP.md**

❌ **MAL:** `PLAN-CICLO-5.md` (2000 líneas)

✅ **BIEN:**
```
02-planes/ciclo-5/
├── _MAP.md                    # Mapa de navegación
├── RESUMEN-CICLO-5.md         # Overview (200L)
├── PLAN-MICRO-5-1.md          # Análisis (150L)
├── PLAN-MICRO-5-2.md          # Database (300L)
├── PLAN-MICRO-5-3.md          # Backend (400L)
├── PLAN-MICRO-5-4.md          # Frontend (350L)
└── PLAN-MICRO-5-5.md          # Validación (200L)
```

---

## 🔗 Relaciones y Ligas (como Foreign Keys)

**Establecer relaciones claras entre archivos**

```markdown
# ANALISIS-2025-11-02-auth-jwt.md

**ID:** ANALISIS-AUTH-JWT-001

**Relacionados:**
- Plan: [PLAN-CICLO-5](../02-planes/ciclo-5/RESUMEN-CICLO-5.md)
- Logs: [LOG-2025-11-02-micro-5-*](../04-logs/backend/2025-11-02-micro-5-*.md)
- Validación: [VALIDATION-auth-jwt](../05-validaciones/integracion/2025-11-02-validation-auth-jwt.md)
- Requerimientos origen: [UC-LOGIN](/docs/01-requerimientos/casos-uso/student/UC-LOGIN.md)
```

---

## ✅ Checklist de Normalización

**Al crear/actualizar documentación:**

- [ ] Archivo tiene un solo propósito (SRP)
- [ ] No duplica información (usar referencias si existe en otro archivo)
- [ ] Sigue estructura consistente con archivos del mismo tipo (LSP)
- [ ] Es específico, no gigante (ISP)
- [ ] Usa referencias a abstracciones (DIP)
- [ ] Tiene relaciones claras con otros archivos (Foreign Keys)
- [ ] Archivo <400L (o modularizado en carpeta con _MAP.md)

---

**Creado:** 2025-11-02
**Autor:** Sistema NEXUS
**Ver también:**
- POLITICAS-MODULARIZACION.md
- DIRECTIVAS-PRINCIPALES.md (DE-003)
