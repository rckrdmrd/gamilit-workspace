# TRIGGER-ANTI-DUPLICACION

**ID:** TRIGGER-ANTI-DUPLICACION
**Version:** 1.0.0
**Tipo:** Automatico
**Fase CAPVED:** Se activa en Fase A (Analisis)

---

## Proposito

Prevenir la creacion de objetos duplicados verificando automaticamente el
catalogo global y los inventarios del proyecto antes de crear cualquier
archivo, componente, servicio, entidad o tabla nueva.

---

## Cuando Se Activa

```yaml
activadores:
  palabras_clave:
    - "crear"
    - "nuevo"
    - "agregar"
    - "implementar"
    - "anadir"
    - "generar"

  tipos_objeto:
    - tabla (DDL)
    - entity
    - service
    - controller
    - componente
    - hook
    - modulo
    - funcionalidad

  ejemplos:
    - "Crear nueva tabla de usuarios"
    - "Agregar entidad PaymentMethod"
    - "Implementar servicio de notificaciones"
    - "Nuevo componente de dashboard"
```

---

## Acciones del Trigger

### Paso 1: Verificar Catalogo Global
```yaml
accion: "Buscar en catalogo de funcionalidades reutilizables"
comando: |
  grep -i "{funcionalidad}" shared/catalog/CATALOG-INDEX.yml

catalogo_contiene:
  - auth (autenticacion y autorizacion)
  - session-management (gestion de sesiones)
  - rate-limiting (limitacion de tasa)
  - notifications (notificaciones email/push)
  - multi-tenancy (soporte multi-tenant)
  - feature-flags (flags dinamicos)
  - websocket (comunicacion tiempo real)
  - payments (integracion pagos)
  - audit-logs (auditoria)
  - portales (templates de portales)
  - template-saas (template SaaS completo)

si_existe_en_catalogo:
  accion: "DETENER creacion"
  mensaje: |
    ATENCION: Esta funcionalidad ya existe en el catalogo global.

    Ubicacion: shared/catalog/{funcionalidad}/
    Documentacion: shared/catalog/{funcionalidad}/README.md

    Recomendacion: Usar SIMCO-REUTILIZAR.md para integrar
    el modulo existente en lugar de crear uno nuevo.

    Si necesita modificaciones, considerar:
    1. Extender el modulo existente
    2. Contribuir mejoras al catalogo

    Para continuar de todos modos, confirmar explicitamente.
```

### Paso 2: Verificar Inventario del Proyecto
```yaml
accion: "Buscar en inventarios del proyecto actual"
comandos:
  - grep -i "{nombre}" orchestration/inventarios/MASTER_INVENTORY.yml
  - grep -i "{nombre}" orchestration/inventarios/DATABASE_INVENTORY.yml
  - grep -i "{nombre}" orchestration/inventarios/BACKEND_INVENTORY.yml
  - grep -i "{nombre}" orchestration/inventarios/FRONTEND_INVENTORY.yml

si_existe_en_inventario:
  accion: "DETENER creacion"
  mensaje: |
    ATENCION: Ya existe un objeto similar en este proyecto.

    Nombre: {nombre_existente}
    Tipo: {tipo}
    Ubicacion: {ruta}

    Opciones:
    1. Reutilizar el existente
    2. Extender el existente
    3. Renombrar el nuevo si es diferente

    Para continuar, clarificar la diferencia.
```

### Paso 3: Buscar Archivos Similares
```yaml
accion: "Buscar archivos con nombre similar en el codigo"
comandos:
  - find apps/ libs/ -name "*{nombre}*" -type f
  - find src/ -name "*{nombre}*" -type f
  - grep -rn "class {Nombre}" apps/ libs/ src/
  - grep -rn "interface {Nombre}" apps/ libs/ src/
  - grep -rn "CREATE TABLE.*{nombre}" database/

si_encuentra_similar:
  accion: "ALERTAR y preguntar"
  mensaje: |
    ATENCION: Se encontraron archivos similares:

    {lista_archivos}

    Por favor confirmar:
    1. Es el mismo objeto? -> Usar el existente
    2. Es diferente? -> Explicar la diferencia
    3. Es un duplicado a consolidar? -> Usar @DELETE-SAFE primero
```

### Paso 4: Evaluar Resultado
```yaml
matriz_decision:
  existe_en_catalogo:
    accion: "REUTILIZAR del catalogo"
    simco: "SIMCO-REUTILIZAR.md"

  no_encontrado:
    accion: "PROCEDER a crear"
    simco: "SIMCO-CREAR.md"

  existe_identico:
    accion: "DETENER"
    mensaje: "Ya existe, no crear duplicado"

  existe_similar:
    accion: "PREGUNTAR"
    mensaje: "Clarificar diferencia antes de continuar"
```

---

## Checklist Rapido Anti-Duplicacion

Antes de crear cualquier objeto nuevo, verificar:

```markdown
[ ] Busque funcionalidad en shared/catalog/CATALOG-INDEX.yml
[ ] Busque "{nombre}" en orchestration/inventarios/
[ ] Busque archivos con find en apps/ y src/
[ ] Busque definiciones con grep (class, interface, CREATE TABLE)
[ ] Confirme que NO existe en catalogo NI en proyecto
[ ] Si existe en catalogo, use SIMCO-REUTILIZAR.md
[ ] Si existe similar, pregunte que hacer antes de continuar
```

---

## Formato de Reporte

Cuando se activa este trigger, generar reporte:

```markdown
## Verificacion Anti-Duplicacion

### Objeto a Crear
- Nombre: {nombre}
- Tipo: {tabla|entity|service|component|...}
- Proyecto: {proyecto}

### Resultado Catalogo Global
- Estado: {ENCONTRADO | NO_ENCONTRADO}
- Detalles: {ubicacion si encontrado}

### Resultado Inventario Proyecto
- Estado: {ENCONTRADO | NO_ENCONTRADO}
- Detalles: {nombre y ubicacion si encontrado}

### Resultado Busqueda Codigo
- Estado: {ENCONTRADO | NO_ENCONTRADO}
- Archivos similares: {lista si encontrados}

### Decision
- [ ] PROCEDER: No se encontraron duplicados
- [ ] REUTILIZAR: Usar modulo del catalogo
- [ ] DETENER: Ya existe en proyecto
- [ ] CONSULTAR: Existe similar, clarificar
```

---

## Excepciones

### Cuando NO aplicar este trigger
```yaml
excepciones:
  - Archivos de configuracion (no son objetos reutilizables)
  - Tests (cada modulo tiene sus propios tests)
  - Documentacion (puede haber docs similares)
  - Migraciones de BD (tienen timestamp unico)
```

---

## Integracion con SIMCO

### Si se encuentra en catalogo
```yaml
siguiente_paso: "Leer SIMCO-REUTILIZAR.md"
acciones:
  1. Leer documentacion del modulo en catalogo
  2. Verificar compatibilidad con proyecto
  3. Seguir instrucciones de integracion
  4. Registrar uso en inventario
```

### Si no se encuentra
```yaml
siguiente_paso: "Leer SIMCO-CREAR.md"
acciones:
  1. Proceder con creacion normal
  2. Seguir principio Doc-Primero
  3. Registrar en inventario al crear
  4. Evaluar si debe agregarse al catalogo
```

---

## Ejemplo de Ejecucion

```
Usuario: Crear servicio de autenticacion para erp-construccion

Sistema:
== TRIGGER-ANTI-DUPLICACION ACTIVADO ==

Paso 1: Verificando catalogo global...
  Buscando: "auth" en shared/catalog/CATALOG-INDEX.yml
  ENCONTRADO: shared/catalog/auth/

Paso 2: Verificando inventario...
  (No aplica - se encontro en catalogo)

Paso 3: Busqueda codigo...
  (No aplica - se encontro en catalogo)

== RESULTADO ==
DETENIDO: Funcionalidad existe en catalogo global.

Ubicacion: shared/catalog/auth/
Contenido:
  - NestJS + JWT + Passport
  - Guards, strategies, decorators
  - Documentacion completa

Recomendacion:
  Usar SIMCO-REUTILIZAR.md para integrar el modulo
  de autenticacion del catalogo.

  Comando sugerido:
  @CREATE-SAFE Integrar modulo auth del catalogo en erp-construccion
```

---

*TRIGGER-ANTI-DUPLICACION v1.0.0 - Sistema SAAD*
