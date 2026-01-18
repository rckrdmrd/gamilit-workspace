# CHECKLIST-FASE-E: Gate de Ejecucion

**Version:** 1.0.0
**Actualizado:** 2026-01-18
**Alias:** `@CHK-EJECUCION`

## Proposito

Validar ejecucion por checkpoints. Cada checkpoint es un gate de validacion.

---

## Checkpoint CP1: Post-Database

**Ejecutar despues de cambios en DDL**

### Validaciones

- [ ] DDL ejecuta sin errores de sintaxis
- [ ] `./scripts/recreate-database.sh` exitoso
- [ ] Tablas creadas/modificadas verificadas
- [ ] Enums definidos correctamente
- [ ] Foreign keys validas
- [ ] Indexes creados si aplica

### Comandos de Validacion

```bash
cd apps/database
./scripts/recreate-database.sh
# Verificar output sin errores
```

### Criterios de Paso CP1

- [ ] Sin errores de ejecucion DDL
- [ ] Estructura de BD consistente

---

## Checkpoint CP2: Post-Backend

**Ejecutar despues de cambios en Backend**

### Validaciones

- [ ] `npm run build` - PASA
- [ ] `npm run lint` - PASA (o warnings aceptables)
- [ ] `npm run test` - PASA (si existen tests)
- [ ] Entity alineada con DDL (campos, tipos)
- [ ] DTO definidos correctamente
- [ ] Service implementado
- [ ] Controller endpoints funcionan

### Comandos de Validacion

```bash
cd apps/backend
npm run build
npm run lint
npm run test
```

### Criterios de Paso CP2

- [ ] Build exitoso
- [ ] Lint pasa (< 5 warnings nuevos)
- [ ] Tests existentes pasan
- [ ] No hay errores de TypeScript

---

## Checkpoint CP3: Post-Frontend

**Ejecutar despues de cambios en Frontend**

### Validaciones

- [ ] `npm run build` - PASA
- [ ] `npm run typecheck` - PASA
- [ ] Componentes renderizan sin errores
- [ ] Integracion con API funciona
- [ ] Tipos alineados con backend DTOs

### Comandos de Validacion

```bash
cd apps/frontend
npm run build
npm run typecheck
```

### Criterios de Paso CP3

- [ ] Build exitoso
- [ ] Typecheck pasa
- [ ] Sin errores de consola en runtime

---

## Checkpoint CP4: Coherencia Entre Capas

**Ejecutar al final de ejecucion**

### Validaciones

- [ ] Entity alineada con DDL:
  - [ ] Todos los campos de tabla tienen propiedad en entity
  - [ ] Tipos TypeScript compatibles con tipos PostgreSQL
  - [ ] Relaciones correctamente definidas

- [ ] DTO alineado con Entity:
  - [ ] DTOs exponen campos necesarios
  - [ ] Transformaciones correctas
  - [ ] Validaciones implementadas

- [ ] Frontend consume correctamente:
  - [ ] Endpoints correctos
  - [ ] Tipos de respuesta alineados
  - [ ] Manejo de errores

### Matriz de Coherencia

| DDL | Backend Entity | Backend DTO | Frontend |
|-----|----------------|-------------|----------|
| [ ] Tabla | [ ] Entity | [ ] DTO | [ ] API call |

### Criterios de Paso CP4

- [ ] Sin gaps de coherencia criticos
- [ ] Documentacion de gaps menores si existen

---

## Checklist General de Ejecucion

### Durante Ejecucion

- [ ] Seguir orden de SUBTASKS.yml
- [ ] Marcar subtareas completadas conforme avanzan
- [ ] No saltarse checkpoints
- [ ] Documentar decisiones tomadas

### Manejo de Errores

- [ ] Si falla un checkpoint: detener y resolver
- [ ] No avanzar con errores pendientes
- [ ] Documentar errores encontrados y resoluciones

### Control de Cambios

- [ ] Commits atomicos por subtarea
- [ ] Mensajes de commit descriptivos
- [ ] No mezclar cambios no relacionados

---

## Criterios de Paso Fase E

**PASA** si:
- CP1 pasa (si hubo cambios DB)
- CP2 pasa (si hubo cambios BE)
- CP3 pasa (si hubo cambios FE)
- CP4 pasa
- Todas las subtareas de E marcadas como completadas

**NO PASA** si:
- Cualquier checkpoint falla
- Build/lint/test fallan
- Gaps de coherencia criticos

---

## Siguiente Fase

Si PASA: Continuar a **Fase D: Documentacion**
Si NO PASA: Resolver errores y re-ejecutar checkpoint

---

## Referencias

- Trigger Coherencia: `orchestration/directivas/triggers/TRIGGER-COHERENCIA-CAPAS.md`
- Inventarios: `orchestration/inventarios/`
