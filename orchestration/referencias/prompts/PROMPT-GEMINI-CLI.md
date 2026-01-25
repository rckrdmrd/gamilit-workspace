# Template: Prompt para Gemini CLI

**Sistema:** SIMCO v4.3.0
**Agente:** Gemini CLI (Gemini 3)
**Tipo:** RAZONADOR (sin subagentes)
**Uso:** Análisis, validación, code review

---

## Características de Gemini CLI

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   GEMINI CLI ES UN MODELO RAZONADOR:                                     ║
║                                                                           ║
║   ✓ Razonamiento complejo                                                ║
║   ✓ Análisis de código                                                   ║
║   ✓ Puede tomar decisiones                                               ║
║   ✓ Puede inferir contexto                                               ║
║                                                                           ║
║   LIMITACIONES:                                                          ║
║   ✗ Sin subagentes                                                       ║
║   ✗ Sin web search                                                       ║
║   ✗ Sin MCP servers                                                      ║
║                                                                           ║
║   IDEAL PARA: Sustituto de Claude cuando no disponible                   ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Template de Prompt - Análisis

```markdown
# [TAREA-ID] Análisis: {NOMBRE}

## Contexto del Workspace
- Workspace: workspace-v2
- Proyecto: {PROYECTO}
- Sistema: SIMCO v4.3.0

## Archivos Relevantes
```
{LISTA_DE_ARCHIVOS}
```

## Objetivo
{DESCRIPCION_DEL_OBJETIVO}

## Entregables Esperados
1. {ENTREGABLE_1}
2. {ENTREGABLE_2}
3. {ENTREGABLE_3}

## Restricciones
- Seguir directivas SIMCO
- No crear archivos sin verificar duplicados
- Documentar decisiones

## Formato de Respuesta
```yaml
analisis:
  hallazgos:
    - {hallazgo_1}
    - {hallazgo_2}
  recomendaciones:
    - {recomendacion_1}
    - {recomendacion_2}
  siguiente_paso: "{accion}"
```
```

---

## Template de Prompt - Code Review

```markdown
# [TAREA-ID] Code Review: {ARCHIVO}

## Archivo a Revisar
Path: `{PATH_COMPLETO}`

## Criterios de Revisión
- [ ] Coherencia con arquitectura existente
- [ ] Patrones de código correctos
- [ ] Sin código duplicado
- [ ] Sin errores obvios
- [ ] Sin vulnerabilidades de seguridad

## Contexto
{DESCRIPCION_DEL_CAMBIO}

## Formato de Respuesta
```yaml
review:
  veredicto: "APROBADO | REQUIERE_CAMBIOS | RECHAZADO"
  issues:
    - tipo: "error | warning | suggestion"
      linea: {N}
      descripcion: "{descripcion}"
      solucion: "{solucion_propuesta}"
  comentarios_generales: "{comentarios}"
```
```

---

## Template de Prompt - Validación

```markdown
# [TAREA-ID] Validación: {NOMBRE}

## Cambios a Validar
{LISTA_DE_CAMBIOS}

## Checklist de Validación
- [ ] Build pasa
- [ ] Lint pasa
- [ ] Tests pasan (si existen)
- [ ] Coherencia entre capas
- [ ] Sin regresiones obvias

## Comandos de Validación
```bash
{COMANDOS}
```

## Formato de Respuesta
```yaml
validacion:
  veredicto: "APROBADA | RECHAZADA"
  build: "PASS | FAIL"
  lint: "PASS | FAIL"
  tests: "PASS | FAIL | N/A"
  issues:
    - "{issue_1}"
  conclusion: "{conclusion}"
```
```

---

## Ejemplo de Uso

```markdown
# [BE-042] Análisis: UserService validación de email

## Contexto del Workspace
- Workspace: workspace-v2
- Proyecto: erp-core
- Sistema: SIMCO v4.3.0

## Archivos Relevantes
```
projects/erp-core/backend/src/users/user.service.ts
projects/erp-core/backend/src/users/dto/create-user.dto.ts
```

## Objetivo
Analizar la implementación actual de UserService para determinar:
1. Si existe validación de email
2. Qué patrones de validación se usan en el proyecto
3. Cómo implementar validación siguiendo patrones existentes

## Entregables Esperados
1. Reporte de estado actual de validaciones
2. Identificación de patrones en el proyecto
3. Propuesta de implementación

## Restricciones
- Seguir directivas SIMCO
- No crear archivos sin verificar duplicados
- Documentar decisiones

## Formato de Respuesta
```yaml
analisis:
  hallazgos:
    - "UserService no tiene validación de email"
    - "CreateUserDto usa class-validator decorators"
  recomendaciones:
    - "Agregar @IsEmail() decorator en DTO"
    - "Agregar validación en service como fallback"
  siguiente_paso: "Implementar validación en DTO primero"
```
```

---

## Cuándo Usar Gemini CLI

| Escenario | Usar Gemini CLI |
|-----------|-----------------|
| Claude no disponible | ✓ |
| Análisis de código | ✓ |
| Code review | ✓ |
| Validación de cambios | ✓ |
| Tarea requiere web search | ✗ (usar Claude) |
| Orquestación multi-agente | ✗ (usar Claude) |

---

*Template para Gemini CLI - RAZONADOR sin subagentes*
