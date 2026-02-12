# SIMCO-EDICION-SEGURA.md

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Aplica a:** TODOS los agentes (Claude Code, Gemini CLI, Trae, Windsurf, Gemini)
**Criticidad:** BLOQUEANTE
**Tipo:** Directiva Obligatoria

---

## Propósito

Esta directiva previene la pérdida de código por placeholders, elipsis o reescrituras
destructivas. Aplica a TODOS los agentes sin excepción.

---

## REGLA PRINCIPAL (BLOQUEANTE)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   PROHIBIDO ABSOLUTAMENTE:                                               ║
║                                                                           ║
║   ✗ // ... resto del código                                              ║
║   ✗ // ... existing code ...                                             ║
║   ✗ /* ... */                                                            ║
║   ✗ # ... resto de la implementación                                     ║
║   ✗ // TODO: implementar                                                 ║
║   ✗ // [código anterior]                                                 ║
║   ✗ // [se mantiene igual]                                               ║
║   ✗ Cualquier forma de resumir o abreviar código existente               ║
║                                                                           ║
║   VIOLACIÓN = CÓDIGO DESTRUIDO = TAREA RECHAZADA                         ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 1. Prohibición de Placeholders y Elipsis

### Patrones PROHIBIDOS

```typescript
// ❌ PROHIBIDO - Destruye código
export class UserService {
  // ... resto de métodos existentes ...

  newMethod() {
    return 'new';
  }
}

// ❌ PROHIBIDO - Placeholder
async function processData() {
  // TODO: implementar lógica
}

// ❌ PROHIBIDO - Resumen
/*
 * ... código de validación existente ...
 */

// ❌ PROHIBIDO - Elipsis en cualquier forma
// [existing imports]
// [previous code remains]
// ... more handlers ...
```

### Forma CORRECTA

```typescript
// ✅ CORRECTO - Edición mínima y localizada
// Solo mostrar las líneas que REALMENTE cambias

// ANTES (líneas 45-48):
async function getUser(id: string) {
  return this.userRepository.findOne(id);
}

// DESPUÉS (líneas 45-50):
async function getUser(id: string) {
  const user = await this.userRepository.findOne(id);
  if (!user) throw new NotFoundException();
  return user;
}
```

---

## 2. Edición Mínima y Localizada

### Principio

```
┌──────────────────────────────────────────────────────────────────┐
│ PRINCIPIO DE EDICIÓN MÍNIMA                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. Identificar EXACTAMENTE qué líneas cambian                    │
│ 2. Modificar SOLO esas líneas                                    │
│ 3. NO tocar código que no requiere cambios                       │
│ 4. NO reformatear código existente                               │
│ 5. NO reorganizar imports que no cambias                         │
│ 6. NO agregar/quitar espacios en blanco innecesarios            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Herramientas de Edición

```yaml
herramientas_permitidas:
  - nombre: "Edit (Claude Code)"
    uso: "old_string → new_string"
    descripcion: "Reemplaza texto específico, mínimo y localizado"

  - nombre: "Edición por líneas"
    uso: "Modificar líneas X-Y"
    descripcion: "Especificar exactamente qué líneas cambian"

herramientas_con_cuidado:
  - nombre: "Write (reescritura completa)"
    cuando: "SOLO si archivo es nuevo o cambio afecta >80% del archivo"
    requiere: "Justificación explícita"

prohibido:
  - nombre: "Copiar archivo con placeholders"
    razon: "Destruye código existente"
```

### Ejemplo de Edición Localizada

```markdown
## Cambio Requerido
Agregar validación de email en UserService

## Ubicación Exacta
Archivo: src/users/user.service.ts
Líneas: 34-36

## Antes (líneas 34-36):
```typescript
async createUser(dto: CreateUserDto) {
  return this.repository.save(dto);
}
```

## Después (líneas 34-40):
```typescript
async createUser(dto: CreateUserDto) {
  const exists = await this.repository.findByEmail(dto.email);
  if (exists) {
    throw new ConflictException('Email already exists');
  }
  return this.repository.save(dto);
}
```

## Líneas afectadas: 3 originales → 7 nuevas (+4 líneas)
```

---

## 3. Protocolo para Cambios Grandes

### Definición de "Cambio Grande"

```yaml
cambio_grande:
  criterios:
    - "Más de 50 líneas modificadas en un archivo"
    - "Más de 3 archivos modificados simultáneamente"
    - "Cambio estructural (mover funciones, renombrar clases)"
    - "Refactorización que afecta múltiples módulos"

  accion_requerida: "DETENERSE y PARTIR"
```

### Protocolo de Partición

```
┌──────────────────────────────────────────────────────────────────┐
│ SI CAMBIO ES DEMASIADO GRANDE:                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. DETENER inmediatamente                                        │
│                                                                  │
│ 2. REPORTAR:                                                     │
│    "Este cambio afecta X líneas en Y archivos.                   │
│     Excede el límite de edición segura (50 líneas/archivo).      │
│     Propongo partir en N subtareas:"                             │
│                                                                  │
│ 3. PROPONER partición:                                           │
│    - Subtarea 1: [descripción] (~20 líneas)                      │
│    - Subtarea 2: [descripción] (~25 líneas)                      │
│    - Subtarea 3: [descripción] (~15 líneas)                      │
│                                                                  │
│ 4. ESPERAR aprobación antes de continuar                         │
│                                                                  │
│ 5. EJECUTAR una subtarea a la vez con validación entre cada una  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Ejemplo de Reporte de Cambio Grande

```markdown
## ⚠️ CAMBIO GRANDE DETECTADO

**Tarea solicitada:** Refactorizar módulo de autenticación

**Análisis de impacto:**
- Archivo: auth.service.ts → 85 líneas afectadas
- Archivo: auth.controller.ts → 45 líneas afectadas
- Archivo: auth.module.ts → 20 líneas afectadas
- Total: 150 líneas en 3 archivos

**Excede límite:** Sí (máx 50 líneas/archivo)

**Propuesta de partición:**

| Subtarea | Archivo | Líneas | Descripción |
|----------|---------|--------|-------------|
| 1 | auth.service.ts (parte 1) | 40 | Refactorizar validateUser |
| 2 | auth.service.ts (parte 2) | 45 | Refactorizar login/logout |
| 3 | auth.controller.ts | 45 | Actualizar endpoints |
| 4 | auth.module.ts | 20 | Actualizar providers |

**¿Procedo con la partición?**
```

---

## 4. Evidencia Obligatoria

### Requisitos de Evidencia

```yaml
evidencia_requerida:
  antes_de_editar:
    - "Leer archivo completo"
    - "Identificar líneas exactas a modificar"
    - "Verificar que no hay placeholders en el plan"

  despues_de_editar:
    - "Mostrar diff limpio (solo líneas cambiadas)"
    - "Ejecutar verificación automática"
    - "Confirmar que archivo es funcional"
```

### Formato de Diff Limpio

```diff
## Diff: src/users/user.service.ts

@@ -34,3 +34,7 @@ export class UserService {
   async createUser(dto: CreateUserDto) {
+    const exists = await this.repository.findByEmail(dto.email);
+    if (exists) {
+      throw new ConflictException('Email already exists');
+    }
     return this.repository.save(dto);
   }
```

### Verificación Automática Obligatoria

```bash
# DESPUÉS de cada edición, ejecutar:

# 1. Verificar sintaxis (archivo no roto)
npx tsc --noEmit {archivo_modificado}

# 2. Verificar que no hay placeholders
grep -n "// \.\.\." {archivo_modificado}
grep -n "TODO:" {archivo_modificado}
grep -n "\[existing" {archivo_modificado}
grep -n "resto del" {archivo_modificado}

# 3. Si hay match en grep → REVERTIR y corregir

# 4. Build completo
npm run build

# 5. Lint
npm run lint
```

### Checklist de Verificación Post-Edición

```markdown
## Verificación de Edición Segura

### 1. Sin Placeholders
- [ ] No hay "// ..." en el archivo
- [ ] No hay "TODO:" sin implementación
- [ ] No hay "[existing code]" o similar
- [ ] No hay comentarios que resuman código

### 2. Edición Mínima
- [ ] Solo se modificaron las líneas necesarias
- [ ] No se reformateó código existente
- [ ] No se reorganizaron imports innecesariamente
- [ ] Cambio es < 50 líneas (o fue particionado)

### 3. Verificación Técnica
- [ ] TypeScript compila sin errores
- [ ] Lint pasa sin errores nuevos
- [ ] Build completo exitoso

### 4. Diff Limpio
- [ ] Diff muestra SOLO cambios intencionales
- [ ] No hay cambios de whitespace innecesarios
- [ ] No hay archivos modificados accidentalmente
```

---

## 5. Consecuencias de Violación

```
┌──────────────────────────────────────────────────────────────────┐
│ SI SE DETECTA VIOLACIÓN:                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. TAREA RECHAZADA inmediatamente                                │
│                                                                  │
│ 2. REVERTIR cambios (git checkout o restaurar backup)            │
│                                                                  │
│ 3. DOCUMENTAR incidente:                                         │
│    - Qué archivo fue dañado                                      │
│    - Qué placeholder/elipsis se usó                              │
│    - Qué código se perdió                                        │
│                                                                  │
│ 4. RE-EJECUTAR tarea correctamente                               │
│                                                                  │
│ 5. AGREGAR validación adicional en futuras tareas                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Reglas por Tipo de Agente

### Claude Code

```yaml
claude_code:
  herramienta_preferida: "Edit (old_string → new_string)"
  verificacion: "Automática antes de aplicar"
  limite_lineas: 50
  accion_exceso: "Partir en subtareas"
```

### Gemini CLI

```yaml
gemini_cli:
  herramienta_preferida: "Edición localizada por líneas"
  verificacion: "Manual + grep de placeholders"
  limite_lineas: 30  # Más estricto por tendencia a resumir
  accion_exceso: "DETENER y pedir partición"

  advertencia_especial: |
    Gemini CLI tiene tendencia a resumir código con placeholders.
    SIEMPRE verificar con grep antes de confirmar edición.
    NUNCA usar "// ..." o cualquier forma de elipsis.
```

### Trae

```yaml
trae:
  herramienta_preferida: "Edición localizada"
  verificacion: "Manual + build"
  limite_lineas: 40
  accion_exceso: "Crear checkpoint y partir"
```

### Windsurf

```yaml
windsurf:
  herramienta_preferida: "Seguir instrucciones literales"
  verificacion: "Build + lint después de cada archivo"
  limite_lineas: 50
  accion_exceso: "Reportar y esperar nuevas instrucciones"

  nota: |
    Windsurf recibe código LITERAL del plan.
    Si el plan tiene placeholders, Windsurf los copiará.
    La responsabilidad de evitar placeholders está en Fase 2.
```

---

## 7. Aliases de Invocación

```
@EDICION-SEGURA     - Esta directiva completa
@NO-PLACEHOLDERS    - Sección de prohibición de placeholders
@EDICION-MINIMA     - Sección de edición mínima
@CAMBIO-GRANDE      - Protocolo para cambios grandes
@VERIFICAR-EDICION  - Checklist de verificación post-edición
```

---

## Referencias

- Roles de agentes: `orchestration/agents/AGENT-ROLES.md`
- Flujo optimizado: `orchestration/directivas/simco/SIMCO-FLUJO-AGENTES.md`
- Procedimiento Windsurf: `orchestration/directivas/procedimientos/PROCEDIMIENTO-WINDSURF-EJECUTAR-TAREA.md`
- Reglas base: `CLAUDE.md`
