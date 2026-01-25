# SIMCO-NOMENCLATURA
**Version:** 1.0.0
**Tipo:** Directiva Operacional
**Prioridad:** P0
**Alias:** @NOMENCLATURA
**Creado:** 2026-01-10
**Depende de:** SIMCO-DOCUMENTACION-PROYECTO.md

---

## 1. Proposito

Estandarizar la nomenclatura de archivos y directorios en todos los proyectos del workspace para garantizar consistencia, predictibilidad y facilidad de navegacion.

---

## 2. Principios de Nomenclatura

### 2.1 Principios Generales

1. **Consistencia:** Mismo patron en todo el proyecto
2. **Descriptivo:** El nombre indica el contenido
3. **Predecible:** Facilita busqueda automatizada
4. **Sin espacios:** Usar guiones o guiones bajos
5. **Case-sensitive:** Respetar mayusculas/minusculas

### 2.2 Convenciones Base

| Elemento | Convencion | Ejemplo |
|----------|------------|---------|
| Archivos MD | UPPER-CASE con guiones | RF-AUTH-001.md |
| Directorios | kebab-case numerado | 01-fase-alcance/ |
| Inventarios | UPPER_SNAKE_CASE | MASTER_INVENTORY.yml |
| Indices | _MAP.md fijo | _MAP.md |

---

## 3. Patrones por Tipo de Archivo

### 3.1 Requerimientos

```
RF-{MODULO}-{NUM}.md

Ejemplos:
RF-AUTH-001.md
RF-CATALOG-002.md
RF-PAYMENTS-003.md
```

### 3.2 Especificaciones Tecnicas

```
ET-{TIPO}-{MODULO}.md
ET-{TIPO}-{MODULO}-{NUM}.md

Ejemplos:
ET-BACKEND-AUTH.md
ET-DATABASE-USERS.md
ET-FRONTEND-DASHBOARD-001.md
```

### 3.3 User Stories

```
US-{EPICA}-{NUM}-{descripcion-corta}.md

Ejemplos:
US-AUTH-001-login-basico.md
US-CATALOG-002-busqueda-productos.md
```

### 3.4 Epicas por Proyecto

| Proyecto | Patron | Ejemplo |
|----------|--------|---------|
| gamilit | EAI-{NUM}-{nombre}/ | EAI-001-fundamentos/ |
| gamilit ext | EXT-{NUM}-{nombre}/ | EXT-005-reportes/ |
| erp-core | MGN-{NUM}-{nombre}/ | MGN-001-auth/ |
| michangarrito | MCH-{NUM}-{nombre}.md | MCH-001-infraestructura.md |
| template-saas | SAAS-{NUM}-{nombre}.md | SAAS-014-whatsapp.md |

### 3.5 ADRs (Architecture Decision Records)

```
ADR-{NNNN}-{descripcion-kebab}.md

Ejemplos:
ADR-0001-monorepo-structure.md
ADR-0002-authentication-strategy.md
```

### 3.6 Documentos Temporales (Fechados)

```
{TIPO}-{DESCRIPCION}-{FECHA}.md

Tipos validos:
- PLAN-
- ANALISIS-
- VALIDACION-
- REPORTE-
- EJECUCION-
- REFINAMIENTO-
- DEPENDENCIAS-

Ejemplos:
PLAN-CONSOLIDACION-BD-2026-01-07.md
ANALISIS-ERRORES-ADMIN-2026-01-07.md
VALIDACION-PLAN-ADMIN-2026-01-07.md
REPORTE-SPRINT-3-2026-01-10.md
```

### 3.7 Trazas

```
TRAZA-{TIPO}-{DESCRIPCION}.md

Ejemplos:
TRAZA-TAREAS-DATABASE.md
TRAZA-TAREAS-BACKEND.md
TRAZA-DEPENDENCIAS-AUTH.md
```

### 3.8 Inventarios

```
{TIPO}_INVENTORY.yml

Tipos estandar:
- MASTER_INVENTORY.yml
- DATABASE_INVENTORY.yml
- BACKEND_INVENTORY.yml
- FRONTEND_INVENTORY.yml
- DEVENV-MASTER-INVENTORY.yml
- DEVENV-PORTS-INVENTORY.yml
```

### 3.9 Indices

```
_MAP.md (fijo, siempre este nombre)

Ubicacion: Raiz de cada directorio principal
Proposito: Indice navegable del contenido
```

---

## 4. Patrones de Directorios

### 4.1 Numeracion por Tipo

| Rango | Tipo | Ejemplo |
|-------|------|---------|
| 00-09 | Vision/Estrategia | 00-vision-general/ |
| 01-89 | Fases del proyecto | 01-fase-alcance/, 02-fase-desarrollo/ |
| 90-94 | Transversal | 90-transversal/ |
| 95 | Guias desarrollo | 95-guias-desarrollo/ |
| 96 | Quick reference | 96-quick-reference/ |
| 97 | ADRs | 97-adr/ |
| 98 | Reservado | - |
| 99 | Finiquito/Cierre | 99-finiquito/ |

### 4.2 Formato de Nombre

```
{NN}-{nombre-en-kebab-case}/

Ejemplos:
00-vision-general/
01-fase-alcance/
02-fase-desarrollo/
90-transversal/
97-adr/
```

---

## 5. Formato de Fechas

### 5.1 En Nombres de Archivo

```
{YYYY}-{MM}-{DD}

Ejemplo: 2026-01-10
```

### 5.2 En Metadata

```yaml
created_date: "2026-01-10"
updated_date: "2026-01-10"
```

### 5.3 En Contenido

```markdown
**Fecha:** 2026-01-10
**Ultima actualizacion:** 2026-01-10
```

---

## 6. Prefijos por Contexto

### 6.1 Tipos de Documento

| Prefijo | Tipo | Uso |
|---------|------|-----|
| RF- | Requerimiento Funcional | Que debe hacer |
| RN- | Regla de Negocio | Como se comporta |
| RNF- | Requerimiento No Funcional | Constraints |
| ET- | Especificacion Tecnica | Como implementar |
| US- | User Story | Perspectiva usuario |
| ADR- | Decision Arquitectonica | Porque elegimos X |
| INT- | Integracion | APIs externas |

### 6.2 Prefijos de Epica por Proyecto

| Proyecto | Prefijo | Significado |
|----------|---------|-------------|
| gamilit | EAI- | Epica Academica Interna |
| gamilit | EXT- | Epica Extension |
| erp-core | MGN- | Modulo General Negocio |
| michangarrito | MCH- | Modulo Changarrito |
| template-saas | SAAS- | Servicio SAAS |

---

## 7. Anti-patrones a Evitar

### 7.1 Nombres Incorrectos

| Incorrecto | Correcto | Razon |
|------------|----------|-------|
| `rf auth 001.md` | `RF-AUTH-001.md` | Sin espacios, uppercase |
| `Plan-Auth.md` | `PLAN-AUTH-2026-01-10.md` | Falta fecha |
| `especificacion.md` | `ET-BACKEND-AUTH.md` | Muy generico |
| `MAPA.md` | `_MAP.md` | Nombre fijo |
| `2026-01-10-plan.md` | `PLAN-DESCRIPCION-2026-01-10.md` | Fecha al final |

### 7.2 Directorios Incorrectos

| Incorrecto | Correcto | Razon |
|------------|----------|-------|
| `fase1/` | `01-fase-alcance/` | Falta numero, nombre |
| `Transversal/` | `90-transversal/` | Minusculas, numero |
| `docs-old/` | (eliminar) | No usar legacy dirs |

---

## 8. Validacion

Para validar nomenclatura, usar:

```
Ver: CHECKLIST-NOMENCLATURA.md
```

### Comandos de Verificacion

```bash
# Verificar archivos RF
find docs -name "RF-*.md" | head

# Verificar directorios numerados
ls -d docs/[0-9][0-9]-*/

# Verificar _MAP.md existen
find docs -name "_MAP.md"
```

---

## 9. Referencias

| Directiva | Proposito |
|-----------|-----------|
| SIMCO-DOCUMENTACION-PROYECTO.md | Estructura general |
| SIMCO-ESTRUCTURA-DOCS.md | Contenido interno |
| CHECKLIST-NOMENCLATURA.md | Validacion |

---

**Ultima actualizacion:** 2026-01-10
**Mantenido por:** Orchestration Team
