# SIMCO: DELEGACION A GEMINI CLI (AHORRO DE TOKENS CLAUDE)

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Aplica a:** Claude Code como orquestador principal  
**Prioridad:** ALTA cuando se solicite ahorro de tokens

---

## 1. Proposito

Definir una via alternativa de delegacion para que Claude descargue la mayor parte de ejecucion en Gemini CLI, minimizando consumo de tokens de Claude sin perder control de calidad.

Principio operativo:
- Claude orquesta y valida.
- Gemini ejecuta subtareas.
- Claude corrige o re-delega cuando el resultado no cumpla.

---

## 2. Activacion

Activar esta directiva cuando:
1. El usuario pida explicitamente ahorrar tokens de Claude.
2. El prompt de inicio indique usar Gemini CLI como subagente.
3. La tarea sea delegable en subtareas pequenas y verificables.

Si no se activa, usar flujo estandar de `SIMCO-DELEGACION.md`.

---

## 3. Regla de Capacidad

- Claude: puede orquestar y validar.
- Gemini CLI: no tiene subagentes nativos; ejecutar en secuencia.
- En este modo, priorizar Gemini para la mayor parte de carga de trabajo siempre que no comprometa calidad.

---

## 4. Estrategia Anti-Context Overflow en Gemini

Para reducir errores de contexto en Gemini:

1. Subtarea pequena: 1-2 archivos maximo.
2. Prompt corto: objetivo + criterios + 1-2 referencias.
3. Respuesta esperada: breve y enfocada.
4. Evitar incluir bloques de codigo largos inline.
5. Si falla por contexto, dividir mas y reintentar.

---

## 5. Protocolo Operativo

### Paso 1: Descomponer
- Claude divide la tarea en subtareas atomicas.
- Cada subtarea define criterios verificables.

### Paso 2: Delegar a Gemini CLI
- Ejecutar Gemini por cada subtarea (secuencial por defecto).
- Ejemplo conceptual:

```bash
gemini --prompt "Subtarea ST-001: ... (objetivo corto + criterios)"
```

### Paso 3: Validar salida
- Claude revisa codigo, coherencia y validaciones tecnicas.
- No aceptar entregas solo por reporte textual.

### Paso 4: Corregir
- Si hay brechas:
  - Re-delegar ajuste puntual a Gemini, o
  - Corregir directamente en Claude cuando sea mas rapido/seguro.

### Paso 5: Consolidar
- Claude integra el resultado final y documenta veredicto.

---

## 6. Politica de API Key Gemini

Orden de preferencia para autenticacion:
1. Configuracion ya activa de Gemini CLI (si funciona, usarla).
2. Variable de entorno `GEMINI_API_KEY`.
3. Fallback: cargar `GEMINI_API_KEY` desde `.env` del workspace si es necesario.

Nunca exponer el valor de la clave en logs, commits o respuestas.

### Ejemplo de fallback en PowerShell (si Gemini CLI no autentica solo)

```powershell
$env:GEMINI_API_KEY = (Get-Content ".env" | Where-Object { $_ -match "^GEMINI_API_KEY=" } | ForEach-Object { ($_ -split "=",2)[1] })
gemini --prompt "Subtarea ST-001: ..."
```

---

## 7. Checklist de Calidad (Claude)

Antes de aceptar una subtarea ejecutada por Gemini:
- [ ] Archivos correctos y alcance cumplido.
- [ ] Build/lint/tests segun corresponda.
- [ ] Sin placeholders o codigo truncado.
- [ ] Coherencia con directivas SIMCO y arquitectura.
- [ ] Si falla, corregido o re-delegado y revalidado.

---

## 8. Relacion con Otras Directivas

- Base de delegacion: `SIMCO-DELEGACION.md`
- Subagente general: `SIMCO-SUBAGENTE.md`
- Delegacion paralela (solo si se solicita explicitamente): `SIMCO-DELEGACION-PARALELA.md`
- Edicion segura: `SIMCO-EDICION-SEGURA.md`

---

**Nota:** Esta directiva no reemplaza a `SIMCO-DELEGACION.md`; la especializa para modo ahorro de tokens en Claude con ejecucion via Gemini CLI.
