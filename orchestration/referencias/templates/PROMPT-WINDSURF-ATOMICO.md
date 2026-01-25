# Template: Prompt Windsurf Atomico

**Version:** 1.0.0
**Uso:** Fase 3 del Flujo Optimizado
**Modelo:** Cascade AI (no-razonador)

---

## Template Ultra-Compacto

```
Ejecutor atomico para {PROYECTO}.

PROCEDIMIENTO: orchestration/directivas/procedimientos/PROCEDIMIENTO-WINDSURF-EJECUTAR-TAREA.md

TAREAS (ejecutar EN ORDEN):
{PEGAR_TAREAS_ATOMICAS}

REGLAS:
- Seguir LITERALMENTE (NO interpretar)
- SI ambiguedad: DETENER y reportar
- Build+lint al final
- Commit+push

Listo.
```

---

## Formato de Tareas Atomicas

Pegar tareas en formato YAML:

```yaml
tareas_atomicas:
  - id: "T001"
    archivo: "{path/completo/archivo.ts}"
    accion: "crear"
    contenido_exacto: |
      import { Injectable } from '@nestjs/common';

      @Injectable()
      export class ExampleService {
        getHello(): string {
          return 'Hello';
        }
      }
    validacion: "npx tsc --noEmit {archivo}"

  - id: "T002"
    archivo: "{path/completo/otro.ts}"
    accion: "modificar"
    lineas: "15-20"
    buscar: |
      // codigo viejo
    reemplazar: |
      // codigo nuevo
    validacion: "npm run lint {archivo}"
```

---

## Ejemplo Completo

```
Ejecutor atomico para gamilit.

PROCEDIMIENTO: orchestration/directivas/procedimientos/PROCEDIMIENTO-WINDSURF-EJECUTAR-TAREA.md

TAREAS (ejecutar EN ORDEN):

- id: "T001"
  archivo: "apps/backend/src/example/example.service.ts"
  accion: "crear"
  contenido_exacto: |
    import { Injectable } from '@nestjs/common';

    @Injectable()
    export class ExampleService {
      getExample(): string {
        return 'example';
      }
    }
  validacion: "npx tsc --noEmit apps/backend/src/example/example.service.ts"

- id: "T002"
  archivo: "apps/backend/src/example/example.module.ts"
  accion: "crear"
  contenido_exacto: |
    import { Module } from '@nestjs/common';
    import { ExampleService } from './example.service';

    @Module({
      providers: [ExampleService],
      exports: [ExampleService],
    })
    export class ExampleModule {}
  validacion: "npx tsc --noEmit apps/backend/src/example/example.module.ts"

REGLAS:
- Seguir LITERALMENTE (NO interpretar)
- SI ambiguedad: DETENER y reportar
- Build+lint al final
- Commit+push

Listo.
```

---

## Notas

- Este template es para Windsurf (modelo NO-RAZONADOR)
- Las tareas DEBEN incluir codigo LITERAL
- NO usar placeholders ni resumir codigo
- El plan atomico lo genera Fase 2 (Claude Code o Trae)
- Windsurf solo EJECUTA, no toma decisiones

---

## Referencias

- Flujo optimizado: `orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md`
- Procedimiento: `orchestration/directivas/procedimientos/PROCEDIMIENTO-WINDSURF-EJECUTAR-TAREA.md`
- Edicion segura: `orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md`
