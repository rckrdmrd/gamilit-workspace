# Template: Prompt para Windsurf SWE (No-Razonador)

**Sistema:** SIMCO v4.3.0
**Agente:** Windsurf SWE (Cascade AI)
**Tipo:** NO-RAZONADOR
**Uso:** Tareas atómicas de ejecución

---

## IMPORTANTE: Reglas para Windsurf

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   WINDSURF ES UN MODELO NO-RAZONADOR:                                    ║
║                                                                           ║
║   ✓ Ejecuta LITERALMENTE lo que se le indica                             ║
║   ✓ NO toma decisiones                                                   ║
║   ✓ NO infiere contexto                                                  ║
║   ✓ NO completa código faltante                                          ║
║                                                                           ║
║   SI EL PROMPT ES AMBIGUO → RESULTADO IMPREDECIBLE                       ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Template de Prompt

```markdown
# [TAREA-ID] Tarea Atómica: {NOMBRE}

## Contexto
Proyecto: {PROYECTO}
Archivo: {PATH_COMPLETO}
Líneas: {INICIO}-{FIN}

## Instrucción EXACTA

### PASO 1: Abrir archivo
Abrir: `{PATH_COMPLETO}`

### PASO 2: Localizar sección
Buscar línea {NUMERO}: `{CONTENIDO_ACTUAL}`

### PASO 3: Modificar
REEMPLAZAR exactamente:
```{lenguaje}
{CÓDIGO_ACTUAL_EXACTO}
```

POR:
```{lenguaje}
{CÓDIGO_NUEVO_EXACTO}
```

### PASO 4: Guardar y validar
1. Guardar archivo
2. Ejecutar: `{COMANDO_VALIDACION}`
3. Verificar: {CRITERIO_EXITO}

## Resultado Esperado
- [ ] Archivo modificado: {PATH}
- [ ] Líneas afectadas: {N}
- [ ] Build: DEBE pasar
- [ ] Lint: DEBE pasar

## SI HAY ERROR
DETENER y reportar:
- Archivo
- Línea
- Error exacto

NO intentar corregir automáticamente.
```

---

## Ejemplo Completo

```markdown
# [BE-042] Tarea Atómica: Agregar validación email

## Contexto
Proyecto: erp-core
Archivo: /home/isem/workspace-v2/projects/erp-core/backend/src/users/user.service.ts
Líneas: 45-50

## Instrucción EXACTA

### PASO 1: Abrir archivo
Abrir: `/home/isem/workspace-v2/projects/erp-core/backend/src/users/user.service.ts`

### PASO 2: Localizar sección
Buscar línea 45: `async createUser(dto: CreateUserDto): Promise<User> {`

### PASO 3: Modificar
REEMPLAZAR exactamente:
```typescript
async createUser(dto: CreateUserDto): Promise<User> {
  const user = this.userRepository.create(dto);
  return this.userRepository.save(user);
}
```

POR:
```typescript
async createUser(dto: CreateUserDto): Promise<User> {
  if (!this.isValidEmail(dto.email)) {
    throw new BadRequestException('Email inválido');
  }
  const user = this.userRepository.create(dto);
  return this.userRepository.save(user);
}

private isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

### PASO 4: Guardar y validar
1. Guardar archivo
2. Ejecutar: `cd /home/isem/workspace-v2/projects/erp-core/backend && npm run build`
3. Verificar: Build exitoso sin errores

## Resultado Esperado
- [ ] Archivo modificado: user.service.ts
- [ ] Líneas afectadas: 6 (agregadas)
- [ ] Build: DEBE pasar
- [ ] Lint: DEBE pasar

## SI HAY ERROR
DETENER y reportar:
- Archivo: user.service.ts
- Línea: donde falló
- Error exacto: copiar mensaje

NO intentar corregir automáticamente.
```

---

## Checklist Pre-Envío

Antes de enviar prompt a Windsurf:

- [ ] Path del archivo es ABSOLUTO
- [ ] Código actual es EXACTO (copiado del archivo)
- [ ] Código nuevo es COMPLETO (no pseudocódigo)
- [ ] Líneas específicas indicadas
- [ ] Comando de validación incluido
- [ ] Criterio de éxito claro
- [ ] Instrucciones de error incluidas

---

*Template para Windsurf SWE - NO-RAZONADOR*
