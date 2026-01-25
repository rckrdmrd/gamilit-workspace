# Definition of Ready (DoR)

**Version:** 1.0.0
**Sistema:** SIMCO v4.0.0
**Alias:** @TPL_DOR

---

## Proposito

Este template define los criterios que una Historia de Usuario (HU) debe cumplir para ser elegible en Sprint Planning. Una HU que no cumpla el DoR NO debe entrar en el Sprint.

---

## Criterios Obligatorios

### 1. Identificacion y Contexto

- [ ] **ID asignado:** Formato `[PREFIJO]-US-[NNN]`
- [ ] **Titulo conciso:** Max 80 caracteres, descriptivo
- [ ] **Epic vinculada:** Referencia a `[PREFIJO]-EP-[NNN]`
- [ ] **Modulo/capa identificados:** BD, Backend, Frontend, o combinacion

### 2. Requisitos Claros

- [ ] **Historia completa:**
  - Como [rol]
  - Quiero [accion]
  - Para [beneficio]
- [ ] **Criterios de aceptacion:** 3-8 criterios especificos y verificables
- [ ] **Caso de exito definido:** Escenario principal documentado
- [ ] **Casos de error identificados:** Al menos 2 escenarios de error

### 3. Estimacion y Alcance

- [ ] **Story Points asignados:** 1, 2, 3, 5, 8, 13 (Fibonacci)
- [ ] **Alcance claro - Incluido:** Que SI esta dentro del scope
- [ ] **Alcance claro - Excluido:** Que NO esta dentro del scope
- [ ] **Validacion por equipo:** Al menos 2 personas validaron estimacion

### 4. Dependencias y Bloqueos

- [ ] **Dependencias identificadas:**
  - HUs de las que depende (si aplica)
  - DDLs previos (si aplica)
  - APIs externas (si aplica)
- [ ] **Bloqueos resueltos:** No hay bloqueadores activos
- [ ] **DDLs disponibles:** Scripts de BD estan listos (si aplica)

### 5. Analisis Inicial (Fase A minima)

- [ ] **Objetos impactados identificados:**
  - Tablas de BD
  - Endpoints de API
  - Componentes de UI
- [ ] **Riesgos tecnicos identificados:** Lista de riesgos y mitigaciones
- [ ] **Consideraciones de seguridad:** Evaluadas si aplica

### 6. Aprobacion

- [ ] **Product Owner aprobo:** Valor de negocio confirmado
- [ ] **Tech Lead valido viabilidad:** Tecnicamente factible

---

## Criterios Condicionales

### Si aplica a Base de Datos

- [ ] Schema identificado
- [ ] Tablas a crear/modificar listadas
- [ ] Relaciones documentadas
- [ ] RLS (Row-Level Security) evaluado

### Si aplica a API/Backend

- [ ] Endpoints a crear/modificar listados
- [ ] DTOs definidos (entrada/salida)
- [ ] Autenticacion/autorizacion clara
- [ ] Rate limiting considerado

### Si aplica a UI/Frontend

- [ ] Mockups o wireframes disponibles
- [ ] Estados de UI definidos (loading, error, empty, success)
- [ ] Responsive design considerado

### Si es Integracion Externa

- [ ] API externa documentada
- [ ] Rate limits conocidos
- [ ] Error handling definido
- [ ] Secrets/configuracion identificados

---

## GATE de Validacion DoR

| Campo | Valor |
|-------|-------|
| **Quien valida** | Product Owner + Tech Lead |
| **Cuando** | Sprint Planning (Parte 1) |
| **Criterio de paso** | 100% de criterios obligatorios marcados |
| **Si falla** | HU retorna a backlog, no entra en Sprint |
| **Metrica** | Tasa de DoR cumplimiento >= 90% |

---

## Checklist Rapido

```
□ ID asignado [PREFIJO]-US-[NNN]
□ Historia completa (Como/Quiero/Para)
□ Criterios verificables (3-8)
□ Story Points asignados
□ Alcance claro (incluido/excluido)
□ Dependencias resueltas
□ Riesgos identificados
□ Aprobaciones: PO + Tech Lead
```

---

## Template de Registro

```yaml
dor_validation:
  hu_id: "[PREFIJO]-US-[NNN]"
  fecha_validacion: "YYYY-MM-DD"
  validado_por:
    po: "[nombre]"
    tech_lead: "[nombre]"

  criterios:
    identificacion: true
    requisitos: true
    estimacion: true
    dependencias: true
    analisis: true
    aprobacion: true

  resultado: "APROBADO | RECHAZADO"
  notas: "[observaciones]"
```

---

**Template:** TEMPLATE-DEFINICION-READY.md
**Version:** 1.0.0

