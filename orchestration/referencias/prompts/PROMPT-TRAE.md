# Template: Prompt para Trae (Gemini Pro)

**Sistema:** SIMCO v4.3.0
**Agente:** Trae (Gemini 3 Pro)
**Tipo:** RAZONADOR
**Uso:** Planes detallados, descomposición en tareas atómicas

---

## Características de Trae

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   TRAE ES UN PLANIFICADOR DETALLADO:                                     ║
║                                                                           ║
║   ✓ Razonamiento profundo                                                ║
║   ✓ Análisis de patrones de código                                       ║
║   ✓ Generación de planes ultra-detallados                                ║
║   ✓ Descomposición en tareas atómicas                                    ║
║                                                                           ║
║   LIMITACIONES:                                                          ║
║   ✗ Sin subagentes                                                       ║
║   ✗ Sin web search                                                       ║
║   ✗ Requiere contexto completo en prompt                                 ║
║                                                                           ║
║   IDEAL PARA: Fase 2 del flujo de 4 fases                                ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Template de Prompt - Plan Detallado

```markdown
# [TAREA-ID] Plan Detallado: {NOMBRE}

## Contexto de Claude Code (Fase 1)
```yaml
tarea: "{descripcion_tarea}"
proyecto: "{proyecto}"
modulos_afectados:
  - "{modulo_1}"
  - "{modulo_2}"
criterios_exito:
  - "{criterio_1}"
  - "{criterio_2}"
```

## Tu Rol (Trae - Fase 2)
Generar un plan ULTRA-DETALLADO para que Windsurf (no-razonador) pueda ejecutar.

## Archivos a Analizar
```
{LISTA_DE_ARCHIVOS_CON_PATHS_COMPLETOS}
```

## Requisitos del Plan

### OBLIGATORIO para cada tarea atómica:
1. **Archivo único**: Máximo 1 archivo por tarea
2. **Líneas específicas**: Indicar líneas exactas a modificar
3. **Código LITERAL**: No pseudocódigo, código real listo para copiar
4. **Máximo 50 líneas**: Por tarea atómica
5. **Validación**: Comando para verificar

### Formato de Salida
```yaml
plan_atomico:
  version: "1.0"
  total_tareas: {N}

  tareas:
    - id: "T-001"
      archivo: "{path_completo}"
      tipo: "CREAR | MODIFICAR | ELIMINAR"
      lineas: "{inicio}-{fin}"
      descripcion: "{que_hace}"
      codigo_actual: |
        {codigo_exacto_actual}
      codigo_nuevo: |
        {codigo_exacto_nuevo}
      validacion: "{comando}"
      dependencias: []

    - id: "T-002"
      # ... siguiente tarea
```

## Restricciones
- NO incluir tareas ambiguas
- NO asumir que Windsurf "entiende" el contexto
- NO usar placeholders (// ..., etc.)
- CADA tarea debe ser independientemente ejecutable
```

---

## Ejemplo Completo

```markdown
# [BE-042] Plan Detallado: Agregar validación de email a UserService

## Contexto de Claude Code (Fase 1)
```yaml
tarea: "Agregar validación de email al crear usuario"
proyecto: "erp-core"
modulos_afectados:
  - "users"
criterios_exito:
  - "Email inválido genera error 400"
  - "Build y lint pasan"
```

## Tu Rol (Trae - Fase 2)
Generar plan ULTRA-DETALLADO para Windsurf.

## Archivos a Analizar
```
/home/isem/workspace-v2/projects/erp-core/backend/src/users/user.service.ts
/home/isem/workspace-v2/projects/erp-core/backend/src/users/dto/create-user.dto.ts
```

## Plan Generado

```yaml
plan_atomico:
  version: "1.0"
  total_tareas: 2

  tareas:
    - id: "T-001"
      archivo: "/home/isem/workspace-v2/projects/erp-core/backend/src/users/dto/create-user.dto.ts"
      tipo: "MODIFICAR"
      lineas: "8-12"
      descripcion: "Agregar decorador @IsEmail() al campo email"
      codigo_actual: |
        @IsString()
        @IsNotEmpty()
        email: string;
      codigo_nuevo: |
        @IsString()
        @IsNotEmpty()
        @IsEmail({}, { message: 'Email debe ser válido' })
        email: string;
      validacion: "cd /home/isem/workspace-v2/projects/erp-core/backend && npm run build"
      dependencias: []

    - id: "T-002"
      archivo: "/home/isem/workspace-v2/projects/erp-core/backend/src/users/user.service.ts"
      tipo: "MODIFICAR"
      lineas: "45-50"
      descripcion: "Agregar validación de email como fallback en service"
      codigo_actual: |
        async createUser(dto: CreateUserDto): Promise<User> {
          const user = this.userRepository.create(dto);
          return this.userRepository.save(user);
        }
      codigo_nuevo: |
        async createUser(dto: CreateUserDto): Promise<User> {
          if (dto.email && !this.isValidEmail(dto.email)) {
            throw new BadRequestException('Email inválido');
          }
          const user = this.userRepository.create(dto);
          return this.userRepository.save(user);
        }

        private isValidEmail(email: string): boolean {
          const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return regex.test(email);
        }
      validacion: "cd /home/isem/workspace-v2/projects/erp-core/backend && npm run build && npm run lint"
      dependencias: ["T-001"]
```

---

## Checklist Pre-Envío a Windsurf

Antes de pasar plan a Windsurf, verificar:

- [ ] Cada tarea tiene archivo único
- [ ] Paths son absolutos
- [ ] Código actual es exacto (verificado)
- [ ] Código nuevo es completo
- [ ] Máximo 50 líneas por tarea
- [ ] Dependencias definidas
- [ ] Comandos de validación incluidos

---

*Template para Trae - Planificador ULTRA-DETALLADO*
