---
titulo: Estandar - Diagramas Entidad-Relacion (ER) ASCII
tipo: estandar-proyecto
version: 1.0.0
fecha_creacion: 2026-02-03
ultima_actualizacion: 2026-02-27
---

# ESTANDAR: DIAGRAMAS ENTIDAD-RELACION (ER) ASCII

**Version:** 1.0.0
**Fecha:** 2026-02-03
**Aplica a:** Documentacion de base de datos en gamilit (18 schemas, 173 tablas)
**Obligatoriedad:** RECOMENDADO para documentacion tecnica

## 1. PROPOSITO

Establecer un formato reproducible y legible para diagramas ER en ASCII, permitiendo:
- Documentacion en archivos Markdown sin dependencias externas
- Versionado en Git con diffs legibles
- Generacion consistente por agentes IA

---

## 2. NOTACION DE ENTIDADES

### 2.1 Formato Basico

```
┌─────────────────────┐
│     ENTITY_NAME     │
├─────────────────────┤
│ *PK id              │
│ +FK other_id        │
│    field_name       │
│    optional_field?  │
└─────────────────────┘
```

### 2.2 Simbolos de Campos

| Simbolo | Significado | Ejemplo |
|---------|-------------|---------|
| `*PK` | Primary Key | `*PK id` |
| `+FK` | Foreign Key | `+FK user_id` |
| `*` | NOT NULL | `* name` |
| `?` | NULLABLE | `description?` |
| `[]` | Array | `tags[]` |
| `{}` | JSONB | `metadata{}` |
| `#` | Unique | `#email` |
| `@` | Index | `@created_at` |

### 2.3 Ejemplo Completo de Entidad

```
┌───────────────────────────────┐
│           USERS               │
├───────────────────────────────┤
│ *PK id            UUID        │
│ #  email          VARCHAR     │
│ *  name           VARCHAR     │
│    phone?         VARCHAR     │
│    metadata{}     JSONB       │
│ @  created_at     TIMESTAMP   │
│ @  updated_at     TIMESTAMP   │
└───────────────────────────────┘
```

---

## 3. NOTACION DE RELACIONES

### 3.1 Lineas de Conexion

```
─────────    Linea horizontal
│            Linea vertical
├── ──┤      Conexiones
└── ──┘      Esquinas
```

### 3.2 Cardinalidades

| Simbolo | Cardinalidad | Significado |
|---------|--------------|-------------|
| `──────` | Sin marca | Conexion simple |
| `──────<` | 1:N | Uno a muchos |
| `>──────` | N:1 | Muchos a uno |
| `>─────<` | N:M | Muchos a muchos |
| `──┼──` | 1:1 obligatorio | Exactamente uno |
| `──○──` | 0..1 opcional | Cero o uno |

### 3.3 Notacion Crow's Foot Simplificada

```
│         1 (exactamente uno)
○         0..1 (cero o uno)
<         N (muchos)
>         N (muchos, direccion inversa)
```

---

## 4. EJEMPLOS DE RELACIONES

### 4.1 Relacion 1:N (User -> Posts)

```
┌─────────────────┐              ┌─────────────────┐
│      USERS      │              │      POSTS      │
├─────────────────┤              ├─────────────────┤
│ *PK id          │──────────<   │ *PK id          │
│ #  email        │              │ +FK user_id     │
│ *  name         │              │ *  title        │
└─────────────────┘              │    content?     │
                                 └─────────────────┘

Lectura: Un USER tiene muchos POSTS. Un POST pertenece a un USER.
```

### 4.2 Relacion 1:1 (User -> Profile)

```
┌─────────────────┐              ┌─────────────────┐
│      USERS      │              │     PROFILES    │
├─────────────────┤              ├─────────────────┤
│ *PK id          │──────┼───────│ *PK id          │
│ #  email        │              │ +FK user_id     │
│ *  name         │              │    bio?         │
└─────────────────┘              │    avatar_url?  │
                                 └─────────────────┘

Lectura: Un USER tiene exactamente un PROFILE.
```

### 4.3 Relacion N:M con Tabla Puente (User <-> Role)

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│      USERS      │      │   USER_ROLES    │      │      ROLES      │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ *PK id          │──<   │ *PK id          │   >──│ *PK id          │
│ #  email        │      │ +FK user_id     │      │ #  name         │
│ *  name         │      │ +FK role_id     │      │    description? │
└─────────────────┘      │ @  assigned_at  │      └─────────────────┘
                         └─────────────────┘

Lectura: Un USER puede tener muchos ROLES. Un ROLE puede asignarse a muchos USERS.
```

### 4.4 Relacion con Cardinalidad Opcional

```
┌─────────────────┐              ┌─────────────────┐
│    EMPLOYEES    │              │   DEPARTMENTS   │
├─────────────────┤              ├─────────────────┤
│ *PK id          │──────○───<   │ *PK id          │
│ +FK dept_id?    │              │ *  name         │
│ *  name         │              └─────────────────┘
└─────────────────┘

Lectura: Un EMPLOYEE puede pertenecer a un DEPARTMENT (opcional).
         Un DEPARTMENT tiene muchos EMPLOYEES.
```

---

## 5. DIAGRAMAS MULTI-ENTIDAD

### 5.1 Ejemplo: Sistema de Blog

```
┌─────────────────┐              ┌─────────────────┐
│      USERS      │              │      POSTS      │
├─────────────────┤              ├─────────────────┤
│ *PK id          │──────────<   │ *PK id          │
│ #  email        │              │ +FK user_id     │
│ *  name         │              │ +FK category_id │───○───┐
└─────────────────┘              │ *  title        │       │
                                 │    content?     │       │
                                 └─────────────────┘       │
                                         │                 │
                                         │<                │
                                         │                 │
                                 ┌───────┴─────────┐       │
                                 │    COMMENTS     │       │
                                 ├─────────────────┤       │
                                 │ *PK id          │       │
                                 │ +FK post_id     │       │
                                 │ +FK user_id     │───────│
                                 │ *  content      │       │
                                 └─────────────────┘       │
                                                           │
                                 ┌─────────────────┐       │
                                 │   CATEGORIES    │<──────┘
                                 ├─────────────────┤
                                 │ *PK id          │
                                 │ #  slug         │
                                 │ *  name         │
                                 └─────────────────┘
```

---

## 6. DIAGRAMAS DE HERENCIA (PostgreSQL)

### 6.1 Table Inheritance

```
                    ┌─────────────────┐
                    │  BASE_ENTITY    │  (tabla padre)
                    ├─────────────────┤
                    │ *PK id          │
                    │ @  created_at   │
                    │ @  updated_at   │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           v                 v                 v
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   CUSTOMERS     │ │    VENDORS      │ │    EMPLOYEES    │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ (inherits)      │ │ (inherits)      │ │ (inherits)      │
│ *  credit_limit │ │ *  tax_id       │ │ +FK dept_id     │
│    company?     │ │    website?     │ │ *  position     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 7. NOTACION DE SCHEMAS

```
┌─────────────────────────────────────────────────────────────┐
│                        SCHEMA: auth                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │    users    │──< │   tokens    │    │   sessions  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       SCHEMA: core                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  companies  │──< │  branches   │──< │ departments │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. CONVENCIONES DE FORMATO

### 8.1 Ancho de Entidades

```yaml
ANCHO_MINIMO: 17 caracteres (incluyendo bordes)
ANCHO_RECOMENDADO: 20-25 caracteres
ANCHO_MAXIMO: 35 caracteres

SI_EXCEDE: Abreviar nombres de campos o crear multiples diagramas
```

### 8.2 Espaciado

```yaml
ENTRE_ENTIDADES_HORIZONTAL: 4-8 espacios
ENTRE_ENTIDADES_VERTICAL: 2-4 lineas
INDENTACION_CAMPOS: 1 espacio despues del borde
```

### 8.3 Caracteres Unicode Preferidos

```
Bordes:       ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ─ │
Flechas:      < > ─ │
Marcadores:   ○ ● ┼
```

---

## 9. HERRAMIENTAS RECOMENDADAS

| Herramienta | Uso | URL |
|-------------|-----|-----|
| ASCIIFlow | Editor visual online | asciiflow.com |
| Monodraw | Editor Mac | monodraw.helftone.com |
| PlantUML | Generacion desde codigo | plantuml.com |
| dbdiagram.io | Diseno ER visual | dbdiagram.io |

---

## 10. CUANDO USAR DIAGRAMAS ER

```yaml
OBLIGATORIO:
  - Documentacion de schemas nuevos
  - PRs que agregan/modifican tablas
  - Documentacion de arquitectura

RECOMENDADO:
  - Analisis de dependencias
  - Investigacion de bugs de BD
  - Onboarding de nuevos desarrolladores

OPCIONAL:
  - Tareas QUICK de correccion
  - Modificaciones menores a campos
```

---

## 11. REFERENCIAS

- **Estandar de Database:** `docs/40-standards/ESTANDAR-DATABASE-PROFESIONAL.md`
- **DDL:** `apps/database/ddl/`
- **Nomenclatura:** `docs/40-standards/ESTANDAR-NOMENCLATURA.md`

## Ver tambien

- [PRINCIPIO-NORMALIZACION-BD](../../orchestration/directivas/principios/PRINCIPIO-NORMALIZACION-BD.md) - Principio de normalizacion de bases de datos y modelado relacional

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Proyecto:** gamilit
