# SECCIÓN: RESPONSABILIDADES

> **Alias:** `@DEF_SEC_RESP`
> **Versión:** 1.0.0
> **Actualizado:** 2026-01-16

---

## Propósito

Template reutilizable para la sección RESPONSABILIDADES de perfiles y documentos.
Define estructura clara para delimitar alcance y tareas.

---

## Template

```markdown
## RESPONSABILIDADES

### Responsabilidades Principales

1. **{Área 1}**
   - {Tarea específica 1.1}
   - {Tarea específica 1.2}

2. **{Área 2}**
   - {Tarea específica 2.1}
   - {Tarea específica 2.2}

### Fuera de Alcance

> Lo que NO es responsabilidad de este rol/componente:
- {Exclusión 1}
- {Exclusión 2}

### Delegación

| Cuando | Delegar a | Razón |
|--------|-----------|-------|
| {Condición} | {Otro perfil/componente} | {Por qué} |
```

---

## Estructura Recomendada

### Para Perfiles de Agente

```markdown
### Responsabilidades Principales

1. **Desarrollo**
   - Crear/modificar código en {dominio}
   - Implementar {tipo de funcionalidad}

2. **Calidad**
   - Escribir tests para cambios realizados
   - Validar build/lint antes de completar

3. **Documentación**
   - Actualizar inventarios afectados
   - Documentar decisiones técnicas

### Fuera de Alcance

- Modificar código en dominios de otros perfiles
- Tomar decisiones de arquitectura global
- Acceder a producción directamente

### Delegación

| Cuando | Delegar a | Razón |
|--------|-----------|-------|
| Cambio DDL requerido | @DATABASE | Especialista en BD |
| Deploy a producción | @DEVOPS | Control de acceso |
```

### Para Módulos/Componentes

```markdown
### Responsabilidades

1. **Funcionalidad Core**
   - {Función principal 1}
   - {Función principal 2}

2. **Integraciones**
   - Con {módulo A}
   - Con {módulo B}

### Fuera de Alcance

- {Funcionalidad que pertenece a otro módulo}
- {Integración no soportada}
```

---

## Ejemplo Completo

```markdown
## RESPONSABILIDADES

### Responsabilidades Principales

1. **Desarrollo Backend**
   - Crear/modificar services, controllers, modules en NestJS
   - Implementar lógica de negocio y validaciones
   - Crear DTOs con class-validator

2. **Base de Datos**
   - Crear/modificar entities con TypeORM
   - Sincronizar entities con DDL existente
   - Implementar migrations cuando se requiera

3. **Testing**
   - Escribir tests unitarios para services
   - Validar coverage mínimo según estándares

4. **Validación**
   - Ejecutar `npm run build` antes de completar
   - Ejecutar `npm run lint` y corregir errores
   - Verificar `npm run test` pasa

### Fuera de Alcance

- Modificar archivos DDL directamente (→ @DATABASE)
- Crear/modificar componentes React (→ @FRONTEND)
- Configurar CI/CD o Docker (→ @DEVOPS)
- Decisiones de arquitectura global (→ @META-ORQUESTADOR)

### Delegación

| Cuando | Delegar a | Razón |
|--------|-----------|-------|
| Nueva tabla requerida | @DATABASE | Control de esquema |
| UI para nuevo endpoint | @FRONTEND | Dominio frontend |
| Cambio en deployment | @DEVOPS | Infraestructura |
| Conflicto de alcance | @META-ORQUESTADOR | Coordinación |
```

---

## Uso en Documentos

```markdown
## RESPONSABILIDADES
> Definición: @DEF_SEC_RESP

[Contenido específico siguiendo el template]
```

---

## Referencias

- `@DEF_SEC_IDENTITY` - Sección identidad (típicamente antes)
- `@DEF_DELEGATION` - Protocolo de delegación completo
- `orchestration/agents/perfiles/` - Ejemplos de uso
