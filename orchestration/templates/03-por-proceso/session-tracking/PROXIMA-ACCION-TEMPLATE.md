# PROXIMA-ACCION.md

**Sistema:** NEXUS v4.0
**Proyecto:** {NOMBRE_PROYECTO}
**Ultima Actualizacion:** {YYYY-MM-DD HH:MM}

---

## Estado Actual

| Campo | Valor |
|-------|-------|
| **Tarea Activa** | {TASK-ID o "Ninguna"} |
| **Fase CAPVED** | {C\|A\|P\|V\|E\|D} |
| **Subtarea** | {descripcion breve} |
| **Dominio** | {DDL\|Backend\|Frontend\|Docs\|Orquestacion} |
| **Porcentaje** | {0-100}% |

---

## Contexto Critico

### Archivos en Edicion
```
{lista de archivos actualmente siendo modificados}
```

### Dependencias Pendientes
```
{lista de archivos que falta modificar}
```

### Bloqueos Conocidos
```
{lista de bloqueos o issues pendientes}
```

### Decisiones Tomadas
```
{decisiones importantes que afectan la implementacion}
```

---

## Siguiente Paso

**Accion:** {descripcion clara de la proxima accion a ejecutar}

**Archivos a Tocar:**
- {archivo_1}
- {archivo_2}

**Validaciones Pendientes:**
- [ ] {validacion_1}
- [ ] {validacion_2}

---

## Para Recuperar Sesion

### Paso 1: Cargar Contexto
```
Leer:
- {archivo_contexto_1}
- {archivo_contexto_2}
```

### Paso 2: Verificar Estado
```bash
# Verificar git
git status
git log -1

# Verificar build (si aplica)
cd {proyecto}/backend && npm run build
```

### Paso 3: Continuar Desde
```
Retomar desde: {descripcion exacta del punto de continuacion}
```

---

## Metricas de Sesion

| Metrica | Valor |
|---------|-------|
| Tokens estimados usados | {numero} |
| Compactaciones | {numero} |
| Archivos modificados | {numero} |
| Commits realizados | {numero} |

---

## Notas

{Cualquier nota relevante para la proxima sesion}

---

*Generado por Sistema NEXUS v4.0*
*Usar este archivo para recuperacion rapida de sesion*
