# HU DERIVADA: DERIVED-{HU-ORIGEN}-{NNN}

**Generada desde:** {HU-ORIGEN-ID}
**Fecha deteccion:** {YYYY-MM-DD}
**Detectada en fase:** {A | V | E} (Analisis | Validacion | Ejecucion)
**Detectada por:** {Agente}

---

## ORIGEN

```yaml
hu_origen:
  id: "{HU-ORIGEN-ID}"
  titulo: "{Titulo de la HU original}"
  estado: "{EN_PROGRESO | COMPLETADA}"

deteccion:
  fase_capved: "{A | V | E}"
  momento: "{descripcion de cuando se detecto}"
  razon: "{por que no estaba en alcance original}"
```

---

## CLASIFICACION

```yaml
tipo: "{BUG | FEATURE | REFACTOR | DEUDA_TECNICA | MEJORA_UX | DEPENDENCIA}"

prioridad_sugerida: "{P0 | P1 | P2 | P3}"
  # P0: Bloquea la HU origen o es critico
  # P1: Importante, deberia hacerse pronto
  # P2: Normal, planificar en siguiente sprint
  # P3: Baja, backlog

justificacion_prioridad: "{por que esta prioridad}"

complejidad_estimada: "{S | M | L | XL}"
  # S: < 2 horas
  # M: 2-8 horas
  # L: 1-3 dias
  # XL: > 3 dias
```

---

## DESCRIPCION

### Contexto

{Descripcion del contexto en el que se detecto este trabajo adicional}

### Problema/Necesidad

{Descripcion clara del problema o necesidad identificada}

### Propuesta de Solucion

{Descripcion de alto nivel de como se podria resolver}

---

## IMPACTO SI NO SE HACE

```yaml
impacto_tecnico:
  - "{impacto 1}"
  - "{impacto 2}"

impacto_negocio:
  - "{impacto 1}"
  - "{impacto 2}"

riesgo_de_no_hacer: "{ALTO | MEDIO | BAJO}"
```

---

## ALCANCE ESTIMADO

### Capas Afectadas

- [ ] Database (DDL)
- [ ] Backend
- [ ] Frontend
- [ ] DevOps/Infra
- [ ] Documentacion

### Objetos Potencialmente Afectados

| Capa | Objeto | Accion Estimada |
|------|--------|-----------------|
| {capa} | {objeto} | {CREATE/MODIFY/DELETE} |

---

## DEPENDENCIAS

### Esta HU Derivada BLOQUEA:

| Item | Descripcion |
|------|-------------|
| {HU/Tarea} | {descripcion} |

### Esta HU Derivada ES BLOQUEADA POR:

| Item | Descripcion | Estado |
|------|-------------|--------|
| {HU/Tarea} | {descripcion} | {estado} |

---

## RELACION CON HU ORIGEN

```yaml
relacion: "{BLOQUEA | COMPLEMENTA | MEJORA | PREREQUISITO}"

puede_hacerse_en_paralelo: "{SI | NO}"

si_es_prerequisito:
  razon: "{por que debe hacerse antes}"
  impacto_si_se_ignora: "{que pasa si se ignora}"
```

---

## CRITERIOS DE ACEPTACION (Preliminares)

```gherkin
DADO {contexto inicial}
CUANDO {accion del usuario/sistema}
ENTONCES {resultado esperado}
```

1. [ ] {Criterio 1}
2. [ ] {Criterio 2}
3. [ ] {Criterio 3}

---

## NOTAS DE DETECCION

```markdown
{Notas del agente que detecto esta HU derivada}

- Que estaba haciendo cuando lo detecto
- Por que considera que es trabajo adicional
- Cualquier contexto relevante
```

---

## VALIDACION DE DERIVADA

### Checklist de Registro

- [ ] ID unico asignado (DERIVED-{ORIGEN}-{NNN})
- [ ] Tipo clasificado correctamente
- [ ] Prioridad justificada
- [ ] Alcance estimado
- [ ] Relacion con HU origen documentada
- [ ] Registrada en HU origen (seccion "HUs Derivadas")

### Siguiente Paso

```yaml
accion_inmediata: "{BACKLOG | PLANIFICAR_SPRINT | BLOQUEA_ORIGEN}"

si_bloquea_origen:
  responsable: "{quien debe decidir}"
  deadline_decision: "{fecha}"
```

---

## HISTORIAL

| Fecha | Accion | Agente |
|-------|--------|--------|
| {fecha} | Creada | {agente} |
| {fecha} | {accion} | {agente} |

---

## VINCULO EN HU ORIGEN

> **IMPORTANTE:** Agregar referencia a esta HU derivada en la HU origen:

```yaml
# En {HU-ORIGEN}/seccion HUs_Derivadas:

HUs_Derivadas:
  - id: "DERIVED-{HU-ORIGEN}-{NNN}"
    tipo: "{tipo}"
    descripcion: "{descripcion breve}"
    detectado_en_fase: "{A | V | E}"
    prioridad: "{P0 | P1 | P2 | P3}"
    estado: "REGISTRADA"
```

---

**Template Version:** 1.0.0 | **Sistema:** SIMCO + CAPVED
