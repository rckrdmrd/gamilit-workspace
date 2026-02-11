# LECCIONES-APRENDIDAS-CONSOLIDACION.md - Sistema de Gestion de Lecciones Aprendidas

**Version:** 1.0.0
**Creado:** 2026-01-16
**Sistema:** SIMCO v3.8+

---

## Proposito

Definir un sistema estructurado para:
1. Registrar lecciones aprendidas durante tareas
2. Consolidar lecciones a nivel de proyecto/workspace
3. Reutilizar lecciones en tareas futuras similares

---

## Estructura de Almacenamiento

```
workspace-v2/
└── orchestration/
    └── retrospectivas/
        ├── LECCIONES-INDEX.yml          # Indice de todas las lecciones
        ├── LECCIONES-POR-TIPO/
        │   ├── LECCIONES-DDL.md          # Lecciones de cambios BD
        │   ├── LECCIONES-BACKEND.md      # Lecciones de backend
        │   ├── LECCIONES-FRONTEND.md     # Lecciones de frontend
        │   ├── LECCIONES-INTEGRACION.md  # Lecciones de integracion
        │   └── LECCIONES-DEVOPS.md       # Lecciones de deployment
        ├── LECCIONES-POR-DOMINIO/
        │   ├── LECCIONES-AUTH.md         # Lecciones de autenticacion
        │   ├── LECCIONES-PAGOS.md        # Lecciones de pagos
        │   └── LECCIONES-{dominio}.md    # Por dominio funcional
        └── RETROSPECTIVAS-MENSUALES/
            ├── RETRO-2026-01.md
            └── RETRO-{YYYY-MM}.md
```

---

## Formato de Leccion Individual

```yaml
# Estructura de una leccion aprendida
leccion:
  id: "LA-{YYYY}{MM}{DD}-{secuencial}"
  fecha: "{YYYY-MM-DD}"
  tarea_origen: "{ID de tarea}"
  proyecto: "{nombre del proyecto}"

  tipo: "DDL | BACKEND | FRONTEND | INTEGRACION | DEVOPS"
  dominio: "{dominio funcional si aplica}"

  titulo: "{titulo descriptivo corto}"

  contexto: |
    {Descripcion del contexto en que surgio la leccion}

  que_funciono: |
    {Lo que funciono bien y deberia repetirse}

  que_mejorar: |
    {Lo que no funciono o podria mejorarse}

  recomendacion: |
    {Recomendacion concreta para futuras tareas similares}

  aplicable_cuando:
    - "{condicion 1}"
    - "{condicion 2}"

  tags:
    - "{tag1}"
    - "{tag2}"

  referencias:
    - "{archivo o documento relacionado}"
```

---

## Procedimiento: Registrar Leccion

### Paso 1: Identificar si hay leccion
Durante o al finalizar una tarea, preguntarse:
- Hubo algo inesperado?
- Algo tomo mas tiempo del esperado? Por que?
- Descubri un patron util?
- Encontre un anti-patron a evitar?
- La documentacion existente fue insuficiente?

**Si alguna respuesta es SI → Registrar leccion**

### Paso 2: Crear entrada de leccion

```markdown
# En archivo correspondiente segun tipo
# Ej: orchestration/retrospectivas/LECCIONES-POR-TIPO/LECCIONES-BACKEND.md

## LA-20260116-001: Transformacion snake_case a camelCase en APIs

**Fecha:** 2026-01-16
**Tarea:** CORR-007
**Proyecto:** GAMILIT

### Contexto
Al integrar endpoints de gamification, el backend retornaba datos en snake_case
pero el frontend esperaba camelCase, causando errores de undefined.

### Que Funciono
- Crear transformers centralizados en utils/
- Aplicar transformacion en capa de API, no en componentes
- Documentar formato esperado en tipos TypeScript

### Que Mejorar
- Debio definirse convencion de naming desde el inicio
- Faltaba validacion de tipos en respuestas de API

### Recomendacion
Para futuras integraciones API:
1. Verificar convencion de naming del backend ANTES de implementar
2. Crear transformer si hay diferencia
3. Aplicar transformer en capa API (no en componentes)
4. Agregar tipos estrictos para respuestas

### Aplicable Cuando
- Integrando nuevo endpoint de backend
- Backend usa convencion diferente al frontend
- Errores de "undefined" en propiedades de respuesta

### Tags
- api-integration
- naming-conventions
- typescript
- transformers
```

### Paso 3: Actualizar indice

```yaml
# orchestration/retrospectivas/LECCIONES-INDEX.yml
lecciones:
  - id: LA-20260116-001
    titulo: "Transformacion snake_case a camelCase en APIs"
    tipo: BACKEND
    dominio: gamification
    archivo: LECCIONES-POR-TIPO/LECCIONES-BACKEND.md
    tags: [api-integration, naming-conventions]
    fecha: 2026-01-16
```

---

## Procedimiento: Consultar Lecciones

### Antes de iniciar tarea similar

```yaml
# Checklist de consulta
[ ] 1. Identificar tipo de tarea (DDL, BACKEND, FRONTEND, etc.)
[ ] 2. Identificar dominio funcional (auth, pagos, gamification, etc.)
[ ] 3. Buscar en LECCIONES-INDEX.yml por tipo y dominio
[ ] 4. Leer lecciones relevantes
[ ] 5. Aplicar recomendaciones si aplican
```

### Busqueda por tags

```bash
# Buscar lecciones por tag
grep -r "api-integration" orchestration/retrospectivas/
```

### Busqueda en indice

```yaml
# Filtrar por tipo
tipo: BACKEND

# Filtrar por dominio
dominio: gamification

# Filtrar por tags
tags: [api-integration]
```

---

## Consolidacion Mensual

### Al finalizar cada mes:

```yaml
# 1. Crear retrospectiva mensual
archivo: orchestration/retrospectivas/RETROSPECTIVAS-MENSUALES/RETRO-{YYYY-MM}.md

# 2. Contenido de retrospectiva mensual
contenido:
  resumen:
    total_lecciones: {numero}
    por_tipo:
      DDL: {n}
      BACKEND: {n}
      FRONTEND: {n}

  temas_recurrentes:
    - tema: "{tema}"
      frecuencia: {n}
      accion_sugerida: "{accion}"

  mejoras_proceso:
    - "{mejora identificada}"

  lecciones_destacadas:
    - id: "{id}"
      razon: "{por que es destacada}"
```

### Template de Retrospectiva Mensual

```markdown
# Retrospectiva Mensual - {YYYY-MM}

## Resumen
- Total lecciones registradas: {n}
- Proyectos activos: {lista}
- Tareas completadas: {n}

## Lecciones por Tipo
| Tipo | Cantidad | Tema Principal |
|------|----------|----------------|
| DDL | {n} | {tema} |
| BACKEND | {n} | {tema} |
| FRONTEND | {n} | {tema} |

## Temas Recurrentes
1. **{tema}** ({n} ocurrencias)
   - Causa raiz: {causa}
   - Accion propuesta: {accion}

## Lecciones Destacadas
### LA-{id}: {titulo}
- Por que es importante: {razon}
- Impacto: {impacto}

## Mejoras al Proceso SIMCO
- {mejora 1}
- {mejora 2}

## Acciones para Proximo Mes
- [ ] {accion 1}
- [ ] {accion 2}
```

---

## Integracion con Ciclo CAPVED

### Fase C (Contexto)
```yaml
# Consultar lecciones relevantes
accion: Buscar en LECCIONES-INDEX.yml
criterio: tipo + dominio de la tarea
resultado: Lista de lecciones a considerar
```

### Fase D (Documentacion)
```yaml
# Registrar nuevas lecciones
accion: Crear entrada en archivo correspondiente
actualizar: LECCIONES-INDEX.yml
```

### Referencia en CHECKLIST-FASE-D.md
```
Paso 10: Registrar Lecciones Aprendidas (si aplica)
```

---

## Categorias de Lecciones

### Por Impacto
```yaml
CRITICO:    # Evito falla mayor o perdida de datos
ALTO:       # Ahorro significativo de tiempo
MEDIO:      # Mejora de calidad/proceso
BAJO:       # Optimizacion menor
```

### Por Tipo de Aprendizaje
```yaml
PATRON:     # Patron util a replicar
ANTI-PATRON:# Practica a evitar
HERRAMIENTA:# Uso de herramienta especifica
PROCESO:    # Mejora de proceso
TECNICO:    # Solucion tecnica especifica
```

---

## Metricas de Lecciones

### Tracking mensual
```yaml
metricas:
  lecciones_registradas: {n}
  lecciones_consultadas: {n}  # Veces que se busco en indice
  lecciones_aplicadas: {n}    # Referenciadas en tareas
  tiempo_ahorrado_estimado: "{horas}"

  distribucion_por_tipo:
    DDL: {%}
    BACKEND: {%}
    FRONTEND: {%}
```

### Indicadores de calidad
```yaml
calidad:
  lecciones_con_recomendacion_clara: {%}
  lecciones_con_tags_utiles: {%}
  lecciones_reutilizadas: {%}
```

---

## Proceso de Depuracion

### Cada trimestre:
```yaml
# Revisar lecciones antiguas
[ ] Siguen siendo relevantes?
[ ] Se han vuelto obsoletas por cambios tecnologicos?
[ ] Se han incorporado a directivas/procesos oficiales?

# Acciones
- Marcar obsoletas con: "estado: OBSOLETA"
- Promover a directiva si son fundamentales
- Archivar si ya no aplican
```

---

## Anti-patrones

### Evitar:
1. **Lecciones vagas:** "Esto fue dificil" (sin contexto)
2. **Sin recomendacion:** Describir problema sin solucion
3. **No indexar:** Registrar sin agregar al indice
4. **No consultar:** Nunca revisar antes de tareas similares
5. **Duplicar:** Registrar misma leccion multiples veces

### Verificar:
```yaml
[ ] Leccion tiene contexto claro
[ ] Leccion tiene recomendacion accionable
[ ] Leccion esta indexada
[ ] Tags son relevantes y buscables
[ ] No existe leccion similar ya registrada
```

---

## Referencias

| Documento | Relacion |
|-----------|----------|
| CHECKLIST-FASE-D.md | Paso 10 refiere a esta directiva |
| PRINCIPIO-CAPVED.md | Fase D incluye lecciones |
| SIMCO-DOCUMENTAR.md | Mencionado en checklist |

---

## Ubicaciones Clave

```
orchestration/retrospectivas/LECCIONES-INDEX.yml     # Indice central
orchestration/retrospectivas/LECCIONES-POR-TIPO/    # Por tipo tecnico
orchestration/retrospectivas/LECCIONES-POR-DOMINIO/ # Por dominio funcional
orchestration/retrospectivas/RETROSPECTIVAS-MENSUALES/ # Consolidacion
```

---

**Sistema:** SIMCO v3.8+ con SAAD
**Ultima actualizacion:** 2026-01-16
