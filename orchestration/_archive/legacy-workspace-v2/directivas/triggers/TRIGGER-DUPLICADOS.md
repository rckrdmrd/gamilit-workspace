# TRIGGER-DUPLICADOS

**ID:** TRIGGER-DUPLICADOS
**Version:** 1.0.0
**Tipo:** Automatico
**Fase CAPVED:** Se activa en Fase A (Analisis)

---

## Proposito

Gestionar la consolidacion de objetos duplicados asegurando que antes de
eliminar cualquier duplicado:
1. Se analicen las capacidades de ambos objetos
2. El objeto que permanece tenga TODAS las funcionalidades
3. Se actualicen TODAS las referencias al objeto eliminado
4. Se valide que el sistema funciona correctamente despues

---

## Cuando Se Activa

```yaml
activadores:
  palabras_clave:
    - "duplicado"
    - "repetido"
    - "consolidar"
    - "merge"
    - "unificar"
    - "eliminar duplicado"

  deteccion_automatica:
    - Objetos con nombres similares encontrados
    - Funcionalidades equivalentes detectadas
    - Codigo copiado identificado

  ejemplos:
    - "Eliminar UserService duplicado"
    - "Consolidar tablas payment y payments"
    - "Unificar componentes Button y CustomButton"
    - "Hay dos implementaciones de autenticacion"
```

---

## Acciones del Trigger

### Paso 1: Identificar Objetos Duplicados
```yaml
accion: "Listar ambos objetos y su ubicacion"
recopilar:
  objeto_1:
    - Nombre
    - Ubicacion (ruta completa)
    - Tipo (tabla/entity/service/component)
    - Fecha creacion (si disponible)

  objeto_2:
    - Nombre
    - Ubicacion (ruta completa)
    - Tipo
    - Fecha creacion (si disponible)

output: |
  ## Objetos Duplicados Identificados

  | Aspecto | Objeto A | Objeto B |
  |---------|----------|----------|
  | Nombre | {nombre_a} | {nombre_b} |
  | Ubicacion | {ruta_a} | {ruta_b} |
  | Tipo | {tipo} | {tipo} |
```

### Paso 2: Analizar Capacidades de Cada Objeto
```yaml
accion: "Extraer y comparar funcionalidades"

para_cada_objeto:
  si_es_tabla:
    - Listar columnas
    - Listar constraints
    - Listar indices
    - Listar foreign keys

  si_es_entity:
    - Listar propiedades
    - Listar decoradores
    - Listar relaciones
    - Listar metodos

  si_es_service:
    - Listar metodos publicos
    - Listar dependencias inyectadas
    - Listar funcionalidades

  si_es_componente:
    - Listar props
    - Listar estados
    - Listar funcionalidades UI

output: |
  ## Comparacion de Capacidades

  ### Objeto A: {nombre_a}
  Capacidades:
  - {capacidad_1}
  - {capacidad_2}
  ...

  ### Objeto B: {nombre_b}
  Capacidades:
  - {capacidad_1}
  - {capacidad_2}
  ...

  ### Diferencias
  | Capacidad | Objeto A | Objeto B |
  |-----------|----------|----------|
  | {cap_1} | SI | NO |
  | {cap_2} | SI | SI |
  ...
```

### Paso 3: Identificar Dependientes de Cada Objeto
```yaml
accion: "Buscar todos los archivos que usan cada objeto"

comandos:
  - grep -rn "{nombre_objeto_a}" apps/ libs/ src/
  - grep -rn "{nombre_objeto_b}" apps/ libs/ src/
  - grep -rn "import.*{NombreA}" apps/ libs/ src/
  - grep -rn "import.*{NombreB}" apps/ libs/ src/

output: |
  ## Dependientes

  ### Dependientes de Objeto A ({nombre_a})
  | Archivo | Linea | Tipo de Uso |
  |---------|-------|-------------|
  | {ruta} | {n} | {import/call} |
  ...
  Total: {n} archivos

  ### Dependientes de Objeto B ({nombre_b})
  | Archivo | Linea | Tipo de Uso |
  |---------|-------|-------------|
  | {ruta} | {n} | {import/call} |
  ...
  Total: {n} archivos
```

### Paso 4: Determinar Objeto a Mantener
```yaml
accion: "Recomendar cual objeto mantener"

criterios:
  1_capacidades:
    - Preferir el que tiene MAS capacidades
    - Si igual, evaluar otros criterios

  2_dependientes:
    - Preferir el que tiene MAS dependientes
    - Menos cambios necesarios

  3_ubicacion:
    - Preferir el que esta en ubicacion mas apropiada
    - Seguir convenciones del proyecto

  4_antiguedad:
    - Preferir el mas antiguo (mas estable)
    - A menos que el nuevo sea claramente mejor

  5_calidad:
    - Preferir el que sigue mejores practicas
    - Mejor documentado

output: |
  ## Recomendacion

  **Mantener:** {nombre_objeto_recomendado}
  **Eliminar:** {nombre_objeto_a_eliminar}

  Razones:
  1. {razon_1}
  2. {razon_2}
  ...
```

### Paso 5: Plan de Consolidacion
```yaml
accion: "Crear plan detallado de consolidacion"

plan:
  fase_1_preparacion:
    - Agregar capacidades faltantes al objeto a mantener
    - Verificar que tiene TODO lo del objeto a eliminar
    - Ejecutar tests

  fase_2_migracion_referencias:
    - Actualizar imports en todos los dependientes
    - Actualizar llamadas/usos
    - Actualizar configuraciones

  fase_3_validacion:
    - Ejecutar build
    - Ejecutar lint
    - Ejecutar tests
    - Verificar funcionalidad manualmente

  fase_4_eliminacion:
    - Eliminar objeto duplicado
    - Ejecutar build final
    - Actualizar inventarios

  fase_5_documentacion:
    - Registrar consolidacion en trazas
    - Actualizar documentacion afectada
```

### Paso 6: Checklist Pre-Eliminacion
```yaml
accion: "Verificar antes de eliminar"

checklist:
  capacidades:
    - [ ] Objeto a mantener tiene TODAS las capacidades del eliminado
    - [ ] No hay funcionalidad perdida
    - [ ] Comportamiento es equivalente

  referencias:
    - [ ] Todas las referencias actualizadas
    - [ ] Imports corregidos
    - [ ] Configuraciones actualizadas

  validacion:
    - [ ] Build pasa sin errores
    - [ ] Lint pasa sin errores
    - [ ] Tests pasan
    - [ ] Funcionalidad verificada

  documentacion:
    - [ ] Inventarios actualizados
    - [ ] Trazas registradas
    - [ ] README actualizado si aplica

solo_eliminar_si: "TODOS los items estan marcados"
```

---

## Formato de Reporte Completo

```markdown
## Analisis de Consolidacion de Duplicados

### Fecha: {fecha}
### Proyecto: {proyecto}

---

## 1. Objetos Identificados

| Aspecto | Objeto A | Objeto B |
|---------|----------|----------|
| Nombre | {nombre_a} | {nombre_b} |
| Tipo | {tipo} | {tipo} |
| Ubicacion | {ruta_a} | {ruta_b} |
| Dependientes | {n_deps_a} | {n_deps_b} |

---

## 2. Comparacion de Capacidades

### Capacidades Comunes
- {capacidad_comun_1}
- {capacidad_comun_2}

### Solo en Objeto A
- {capacidad_solo_a_1}

### Solo en Objeto B
- {capacidad_solo_b_1}

---

## 3. Dependientes

### Objeto A ({n} dependientes)
{lista_dependientes_a}

### Objeto B ({n} dependientes)
{lista_dependientes_b}

---

## 4. Recomendacion

**MANTENER:** {nombre_recomendado}
**ELIMINAR:** {nombre_a_eliminar}

**Razones:**
1. {razon_1}
2. {razon_2}

---

## 5. Plan de Consolidacion

### Fase 1: Preparacion
- [ ] Agregar {capacidades_faltantes} a {objeto_mantener}
- [ ] Verificar equivalencia funcional

### Fase 2: Migracion de Referencias
- [ ] {archivo_1}: actualizar import/uso
- [ ] {archivo_2}: actualizar import/uso
...

### Fase 3: Validacion
- [ ] npm run build
- [ ] npm run lint
- [ ] npm run test
- [ ] Verificacion manual

### Fase 4: Eliminacion
- [ ] Eliminar {objeto_a_eliminar}
- [ ] Build final

### Fase 5: Documentacion
- [ ] Actualizar inventarios
- [ ] Registrar en trazas

---

## 6. Checklist Pre-Eliminacion

- [ ] Objeto restante tiene TODAS las capacidades
- [ ] TODAS las referencias actualizadas
- [ ] Build pasa
- [ ] Tests pasan
- [ ] Documentacion actualizada

**Estado:** {LISTO_PARA_ELIMINAR | PENDIENTE}
```

---

## Ejemplos de Ejecucion

### Ejemplo 1: Servicios Duplicados
```
Usuario: Hay dos UserService, uno en core y otro en auth

Sistema:
== TRIGGER-DUPLICADOS ACTIVADO ==

## 1. Objetos Identificados
| Aspecto | Objeto A | Objeto B |
|---------|----------|----------|
| Nombre | UserService | UserService |
| Ubicacion | core/user.service.ts | auth/user.service.ts |
| Dependientes | 8 archivos | 3 archivos |

## 2. Comparacion de Capacidades
### Comunes
- findById()
- findByEmail()
- create()
- update()

### Solo en core/UserService
- findAll()
- delete()
- updatePassword()

### Solo en auth/UserService
- validateCredentials()

## 3. Recomendacion
**MANTENER:** core/user.service.ts
**ELIMINAR:** auth/user.service.ts

Razones:
1. Mas capacidades (7 vs 5 metodos)
2. Mas dependientes (8 vs 3)
3. Ubicacion mas apropiada (core)

## 4. Plan
1. Agregar validateCredentials() a core/UserService
2. Actualizar 3 archivos que usan auth/UserService
3. Validar build + tests
4. Eliminar auth/user.service.ts
```

### Ejemplo 2: Tablas Duplicadas
```
Usuario: Consolidar tablas 'payment' y 'payments'

Sistema:
== TRIGGER-DUPLICADOS ACTIVADO ==

## 1. Objetos Identificados
| Aspecto | payment | payments |
|---------|---------|----------|
| Columnas | 8 | 10 |
| FK | 2 | 3 |
| Indices | 1 | 2 |

## 2. Comparacion
### Solo en 'payments'
- cancelled_at (timestamp)
- cancellation_reason (varchar)

## 3. Recomendacion
**MANTENER:** payments (mas completa)
**ELIMINAR:** payment

## 4. Plan
1. Verificar 'payments' tiene todo de 'payment' (SI)
2. Migrar datos de 'payment' a 'payments' si hay
3. Actualizar Entity PaymentEntity -> usar tabla 'payments'
4. Actualizar DDL scripts
5. Actualizar 5 archivos con referencias
6. Recrear BD limpia
7. Eliminar tabla 'payment'
```

---

## Notas Importantes

### NUNCA eliminar sin verificar
```yaml
regla_de_oro: |
  NUNCA eliminar un objeto duplicado hasta que:
  1. El objeto restante tenga TODAS sus capacidades
  2. TODAS las referencias esten actualizadas
  3. Build y tests pasen

  Si hay CUALQUIER duda, preguntar antes de eliminar.
```

### Rollback
```yaml
si_algo_falla:
  1. Restaurar objeto eliminado (git checkout)
  2. Revertir cambios en referencias
  3. Analizar que salio mal
  4. Corregir y reintentar
```

---

*TRIGGER-DUPLICADOS v1.0.0 - Sistema SAAD*
