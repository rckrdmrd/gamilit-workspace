# TEMPLATE: Tarea DevEnv - Configuracion de Entorno

**Version:** 1.0.0
**Fecha:** 2026-01-04
**Perfil Asignado:** @PERFIL_DEVENV
**Tipo:** Tarea Tecnica

---

## INSTRUCCIONES DE USO

Este template se usa para crear tareas de configuracion de entorno de desarrollo.
Reemplazar los placeholders `{...}` con valores reales.

---

## TASK-DEVENV-{PROYECTO}-{SPRINT}

### Metadata

```yaml
id: "TASK-DEVENV-{PROYECTO}-{SPRINT}"
tipo: "Tarea Tecnica"
perfil: "@PERFIL_DEVENV"
proyecto: "{PROYECTO}"
sprint: "{SPRINT}"
prioridad: "Alta"
estimacion: "2-4 horas"
bloquea:
  - "Tareas de desarrollo del sprint"
bloqueado_por: []
```

### Descripcion

Configurar y documentar el entorno de desarrollo para el proyecto **{PROYECTO}**.

Esta tarea incluye:
- Inventariar herramientas y versiones requeridas
- Asignar puertos sin conflictos con otros proyectos
- Definir nombre de base de datos y usuario
- Documentar variables de entorno
- Crear archivos de configuracion

### Contexto

```yaml
proyecto: "{PROYECTO}"
nivel: "{NIVEL_2A | NIVEL_2B | NIVEL_2B.x}"
tipo_proyecto: "{standalone | suite | vertical}"
stack:
  backend: "{NestJS | Express | FastAPI | ...}"
  frontend: "{React | Vue | Next.js | ...}"
  database: "{PostgreSQL | MySQL | MongoDB | ...}"
```

### Entregables

- [ ] `orchestration/environment/ENVIRONMENT-INVENTORY.yml` - Inventario completo
- [ ] `.env.example` - Variables de entorno documentadas
- [ ] `.env.ports` - Puertos asignados
- [ ] Registro en `orchestration/inventarios/DEVENV-MASTER-INVENTORY.yml` (workspace)
- [ ] Registro en `orchestration/inventarios/DEVENV-PORTS-INVENTORY.yml` (workspace)

### Criterios de Aceptacion

#### Inventario Completo
- [ ] Herramientas listadas con versiones (Node, Python, etc.)
- [ ] Servicios documentados (backend, frontend, workers)
- [ ] Base de datos documentada (nombre, usuario, puerto)
- [ ] Dependencias de sistema documentadas

#### Puertos Asignados
- [ ] Puerto de frontend asignado del rango correspondiente
- [ ] Puerto de backend asignado del rango correspondiente
- [ ] Puertos adicionales asignados si aplica
- [ ] Sin conflictos con otros proyectos (verificado en DEVENV-PORTS-INVENTORY)

#### Base de Datos
- [ ] Nombre de BD definido segun convencion: `{proyecto}_{ambiente}`
- [ ] Usuario de BD definido segun convencion: `{proyecto}_dev`
- [ ] Schemas documentados si aplica

#### Variables de Entorno
- [ ] `.env.example` con todas las variables requeridas
- [ ] Descripcion de cada variable
- [ ] Valores de ejemplo (no secretos reales)
- [ ] Variables sensibles marcadas

#### Configuracion Docker (si aplica)
- [ ] `docker-compose.yml` funcional
- [ ] Volumes documentados
- [ ] Networks definidos

#### Documentacion
- [ ] Instrucciones de setup en README o docs/
- [ ] Pasos para levantar entorno local
- [ ] Troubleshooting comun

### Pasos de Ejecucion

```yaml
paso_1:
  nombre: "Cargar contexto"
  acciones:
    - "Leer DEVENV-MASTER-INVENTORY.yml"
    - "Leer DEVENV-PORTS-INVENTORY.yml"
    - "Identificar rango de puertos disponible"

paso_2:
  nombre: "Inventariar herramientas"
  acciones:
    - "Identificar runtime (Node version, Python version)"
    - "Listar frameworks (NestJS, React, etc.)"
    - "Documentar herramientas de build"
    - "Listar testing frameworks"

paso_3:
  nombre: "Asignar puertos"
  acciones:
    - "Seleccionar puertos del rango asignado"
    - "Verificar no hay conflictos"
    - "Documentar en .env.ports"

paso_4:
  nombre: "Configurar base de datos"
  acciones:
    - "Definir nombre: {proyecto}_{ambiente}"
    - "Definir usuario: {proyecto}_dev"
    - "Documentar schemas si aplica"

paso_5:
  nombre: "Crear .env.example"
  acciones:
    - "Listar todas las variables requeridas"
    - "Agregar descripciones"
    - "Incluir valores de ejemplo"

paso_6:
  nombre: "Crear ENVIRONMENT-INVENTORY.yml"
  acciones:
    - "Usar template TEMPLATE-ENVIRONMENT-INVENTORY.yml"
    - "Completar todas las secciones"
    - "Guardar en orchestration/environment/"

paso_7:
  nombre: "Actualizar inventarios de workspace"
  acciones:
    - "Agregar proyecto a DEVENV-MASTER-INVENTORY.yml"
    - "Registrar puertos en DEVENV-PORTS-INVENTORY.yml"

paso_8:
  nombre: "Validar"
  acciones:
    - "Verificar no hay conflictos de puertos"
    - "Verificar nombres de BD unicos"
    - "Probar que entorno levanta correctamente"
```

### Notas

```
{Agregar notas especificas del proyecto aqui}
```

---

## EJEMPLO COMPLETADO

```yaml
# Ejemplo para proyecto "gamilit"

id: "TASK-DEVENV-GAMILIT-S0"
proyecto: "gamilit"
sprint: "Sprint 0"

puertos_asignados:
  frontend: 3005
  backend: 3006
  storybook: 3007

base_de_datos:
  nombre: "gamilit_development"
  usuario: "gamilit_dev"
  puerto: 5432

herramientas:
  node: "20.x"
  npm: "10.x"
  postgresql: "15"

entregables_completados:
  - "projects/gamilit/orchestration/environment/ENVIRONMENT-INVENTORY.yml"
  - "projects/gamilit/apps/backend/.env.example"
  - "projects/gamilit/.env.ports"
```

---

**Template creado por:** @PERFIL_DEVENV
**Sistema:** NEXUS v3.4 + SIMCO
