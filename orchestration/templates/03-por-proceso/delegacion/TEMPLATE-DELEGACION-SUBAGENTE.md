# Delegacion a Subagente: {TAREA}

**Agente Principal:** {PERFIL_PRINCIPAL}
**Subagente:** {PERFIL_SUBAGENTE}
**Fecha:** {YYYY-MM-DD}
**Proyecto:** {PROYECTO}

---

## 1. Contexto de Delegacion

### 1.1 Tarea Original
```yaml
tarea_id: "{ID}"
descripcion: "{descripcion de la tarea}"
tipo: "feature | fix | refactor | docs"
prioridad: "P0 | P1 | P2 | P3"
```

### 1.2 Razon de Delegacion
- [ ] Requiere expertise especializado
- [ ] Division de trabajo por dominio
- [ ] Paralelizacion de subtareas
- [ ] Otra: {especificar}

---

## 2. Alcance Delegado

### 2.1 Subtarea Asignada
```yaml
subtarea_id: "{ID-SUB}"
descripcion: "{descripcion especifica}"
dominio: "database | backend | frontend | docs"
```

### 2.2 Entregables Esperados
1. {entregable 1}
2. {entregable 2}
3. {entregable 3}

### 2.3 Criterios de Aceptacion
- [ ] {criterio 1}
- [ ] {criterio 2}
- [ ] {criterio 3}

---

## 3. Contexto Transferido

### 3.1 Variables Resueltas
```yaml
# Copiar variables relevantes del contexto principal
DB_NAME: "{valor}"
BACKEND_ROOT: "{valor}"
# ... otras variables necesarias
```

### 3.2 Archivos Relevantes
| Archivo | Proposito | Accion |
|---------|-----------|--------|
| `{ruta1}` | {proposito} | Leer/Modificar |
| `{ruta2}` | {proposito} | Leer/Crear |

### 3.3 Dependencias
- Depende de: {tareas previas completadas}
- Bloquea a: {tareas que esperan este resultado}

---

## 4. Restricciones

### 4.1 Lo que DEBE hacer
- {obligatorio 1}
- {obligatorio 2}

### 4.2 Lo que NO DEBE hacer
- {prohibido 1}
- {prohibido 2}

### 4.3 Decisiones Pre-tomadas
- {decision 1 que no debe cambiar}
- {decision 2 que no debe cambiar}

---

## 5. Comunicacion

### 5.1 Puntos de Sincronizacion
- Al iniciar: Confirmar entendimiento
- Durante: Reportar bloqueos inmediatamente
- Al finalizar: Entregar resumen de cambios

### 5.2 Canal de Escalamiento
```yaml
bloqueo_tecnico: "Reportar al agente principal"
duda_de_negocio: "Escalar a usuario"
fuera_de_alcance: "Registrar y no ejecutar"
```

---

## 6. Validacion Post-Ejecucion

### 6.1 Checklist de Entrega
- [ ] Codigo compila sin errores
- [ ] Lint pasa sin warnings
- [ ] Tests relevantes pasan
- [ ] Documentacion actualizada
- [ ] Inventarios actualizados

### 6.2 Reporte de Completitud
```yaml
# Completar al finalizar
estado: "completado | parcial | bloqueado"
archivos_creados: []
archivos_modificados: []
issues_encontrados: []
tiempo_real: "{duracion}"
```

---

## Referencias

- Template completo: `orchestration/templates/TEMPLATE-DELEGACION-COMPLETA.md`
- Perfiles de agentes: `orchestration/agents/perfiles/`
- Sistema SIMCO: `orchestration/directivas/simco/`
