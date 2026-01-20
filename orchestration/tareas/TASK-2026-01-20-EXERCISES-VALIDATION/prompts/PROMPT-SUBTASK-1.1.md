# PROMPT-SUBTASK-1.1: Validar SubmitExerciseButton en Todos los Ejercicios

## Perfil Asignado
**@PERFIL_FRONTEND**

## Objetivo
Validar que el componente `SubmitExerciseButton` este correctamente integrado en los 30 ejercicios principales + 4 auxiliares, verificando:
1. Uso consistente del componente
2. Props correctamente pasadas
3. Conexion con hook `useExerciseSubmission`
4. Manejo de estados (loading, disabled, success)

## Contexto Necesario

### Componente Principal
```
/apps/frontend/src/shared/components/mechanics/SubmitExerciseButton.tsx
```

### Hook de Envio
```
/apps/frontend/src/features/exercises/hooks/useExerciseSubmission.ts
```

### Ejercicios a Validar

#### M1 - Comprension Literal (7)
```
/apps/frontend/src/features/exercises/components/m1-comprension-literal/
├── Crucigrama.tsx
├── VerdaderoFalso.tsx
├── Emparejamiento.tsx
├── SopaLetras.tsx
├── CompletarEspacios.tsx
├── MapaConceptual.tsx
└── Timeline.tsx
```

#### M2 - Comprension Inferencial (6)
```
/apps/frontend/src/features/exercises/components/m2-comprension-inferencial/
├── DetectiveTextual.tsx
├── ConstruccionHipotesis.tsx
├── PrediccionNarrativa.tsx
├── PuzzleContexto.tsx
├── RuedaInferencias.tsx
└── LecturaInferencial.tsx
```

#### M3 - Comprension Critica (5)
```
/apps/frontend/src/features/exercises/components/m3-comprension-critica/
├── TribunalOpiniones.tsx
├── DebateDigital.tsx
├── AnalisisFuentes.tsx
├── PodcastArgumentativo.tsx
└── MatrizPerspectivas.tsx
```

#### M4 - Lectura Digital (5)
```
/apps/frontend/src/features/exercises/components/m4-lectura-digital/
├── VerificadorFakeNews.tsx
├── InfografiaInteractiva.tsx
├── QuizTikTok.tsx
├── NavegacionHipertextual.tsx
└── AnalisisMemes.tsx
```

#### M5 - Produccion Lectora (3)
```
/apps/frontend/src/features/exercises/components/m5-produccion-lectora/
├── DiarioMultimedia.tsx
├── ComicDigital.tsx
└── VideoCarta.tsx
```

#### Auxiliares (4)
```
/apps/frontend/src/features/exercises/components/auxiliares/
├── ComprensionAuditiva.tsx
├── CollagePrensa.tsx
├── TextoEnMovimiento.tsx
└── CallToAction.tsx
```

### Documentacion de Referencia
- `docs/90-transversal/mecanicas/SPEC-MECANICAS-M1-M3.md`
- `docs/90-transversal/mecanicas/SPEC-MECANICAS-M4.md`
- `docs/90-transversal/mecanicas/SPEC-MECANICAS-M5.md`

## Instrucciones

### Paso 1: Analizar SubmitExerciseButton
1. Leer el componente completo
2. Identificar todas las props disponibles
3. Documentar el flujo de envio
4. Identificar dependencias (hooks, contextos)

### Paso 2: Validar Integracion por Ejercicio
Para cada ejercicio:
1. Buscar uso de `SubmitExerciseButton` o alternativa
2. Verificar props pasadas son correctas
3. Verificar uso de `useExerciseSubmission`
4. Documentar si usa patron alternativo

### Paso 3: Identificar Inconsistencias
1. Ejercicios que NO usan SubmitExerciseButton
2. Ejercicios que usan boton custom sin razon
3. Props faltantes o incorrectas
4. Manejo de estados incorrecto

### Paso 4: Documentar Hallazgos
Crear tabla de validacion con columnas:
- Ejercicio
- Usa SubmitExerciseButton (Si/No)
- Props correctas (Si/No/Parcial)
- Usa useExerciseSubmission (Si/No)
- Estado de integracion (OK/GAP/CRITICO)
- Notas

## Entregables Esperados

1. **VALIDACION-SUBMIT-BUTTON.md** en carpeta de tarea con:
   - Analisis del componente SubmitExerciseButton
   - Tabla de validacion de 34 ejercicios
   - Lista de inconsistencias encontradas
   - Recomendaciones de correccion

2. **Actualizacion de METADATA.yml** si se encuentran nuevos gaps

## Criterios de Aceptacion

- [ ] 34 ejercicios validados
- [ ] Tabla completa con estado de cada ejercicio
- [ ] Gaps identificados con severidad
- [ ] Recomendaciones concretas de correccion
- [ ] Build pasa sin errores (si se hacen cambios)

## Gap Conocido Relacionado

**GAP-EX-001**: Emparejamiento no envia respuesta al backend
- Este gap debe ser investigado especificamente
- Verificar si usa SubmitExerciseButton correctamente
- Documentar causa raiz

---

*Tiempo estimado: 3 horas*
*Dependencias: Ninguna*
