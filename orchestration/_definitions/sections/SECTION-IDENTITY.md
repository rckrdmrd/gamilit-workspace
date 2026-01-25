# SECCIÓN: IDENTIDAD DE PERFIL

> **Alias:** `@DEF_SEC_IDENTITY`
> **Versión:** 1.0.0
> **Actualizado:** 2026-01-16

---

## Propósito

Template reutilizable para la sección IDENTIDAD de perfiles de agente.
Garantiza consistencia en la presentación de información básica.

---

## Template

```markdown
## IDENTIDAD

| Campo | Valor |
|-------|-------|
| **Nombre** | {NOMBRE_PERFIL} |
| **Código** | {CODIGO} |
| **Versión** | {VERSION} |
| **Dominio** | {DOMINIO_PRINCIPAL} |
| **Hereda de** | {PERFIL_BASE} (si aplica) |
| **Estado** | ACTIVO / DEPRECADO / EXPERIMENTAL |

### Stack Tecnológico (si aplica)

| Tecnología | Versión | Uso |
|------------|---------|-----|
| {tech1} | {version} | {uso} |
| {tech2} | {version} | {uso} |
```

---

## Campos Obligatorios

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Nombre | Nombre descriptivo del perfil | "Backend Developer" |
| Código | Código único corto | "BACKEND" |
| Versión | Semver del perfil | "2.0.0" |
| Dominio | Área principal de trabajo | "Backend NestJS/TypeORM" |
| Estado | Estado actual del perfil | "ACTIVO" |

## Campos Opcionales

| Campo | Cuándo Usar | Ejemplo |
|-------|-------------|---------|
| Hereda de | Si extiende otro perfil | "BASE-DEVELOPER" |
| Stack Tecnológico | Para perfiles técnicos | NestJS, TypeORM, PostgreSQL |
| Proyectos Activos | Para perfiles específicos | erp-core, template-saas |

---

## Ejemplo Completo

```markdown
## IDENTIDAD

| Campo | Valor |
|-------|-------|
| **Nombre** | Backend Developer |
| **Código** | BACKEND |
| **Versión** | 2.0.0 |
| **Dominio** | Backend NestJS/TypeORM |
| **Hereda de** | BASE-DEVELOPER |
| **Estado** | ACTIVO |

### Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| NestJS | ^10.0 | Framework principal |
| TypeORM | ^0.3 | ORM |
| PostgreSQL | ^15 | Base de datos |
| TypeScript | ^5.0 | Lenguaje |
```

---

## Uso en Perfiles

```markdown
## IDENTIDAD
> Definición: @DEF_SEC_IDENTITY

| Campo | Valor |
|-------|-------|
| **Nombre** | Mi Perfil |
| ... | ... |
```

---

## Referencias

- `orchestration/agents/perfiles/` - Perfiles que usan esta sección
- `@DEF_SEC_RESP` - Template de responsabilidades (siguiente sección típica)
