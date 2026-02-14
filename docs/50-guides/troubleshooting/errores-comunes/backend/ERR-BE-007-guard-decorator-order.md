# ERR-BE-007: Orden Incorrecto de Decoradores Guard

## Descripcion
Los decoradores `@UseGuards()` en controladores NestJS se aplican en un orden incorrecto, causando que la autenticacion o autorizacion falle. En gamilit, `JwtAuthGuard` debe ejecutarse antes que `RolesGuard` o `AdminGuard` para que el objeto `user` este disponible en el request cuando se verifican los roles.

## Sintomas
- Error 403 Forbidden en requests con token JWT valido y rol correcto
- Error 401 Unauthorized intermitente en rutas protegidas
- `request.user` es `undefined` dentro del guard de roles
- Error: `Cannot read properties of undefined (reading 'roles')` en RolesGuard
- Swagger "Try it out" falla con 403 aunque el token tenga permisos correctos
- Un endpoint funciona con `@UseGuards(JwtAuthGuard)` solo pero falla al agregar `RolesGuard`

## Causa Raiz
1. **Orden invertido de guards:** `@UseGuards(RolesGuard, JwtAuthGuard)` ejecuta RolesGuard primero, pero `request.user` aun no esta poblado porque JwtAuthGuard no ha corrido
2. **Guard de roles sin guard de autenticacion:** `@UseGuards(RolesGuard)` sin JwtAuthGuard; el token no se valida y `request.user` no existe
3. **Guard a nivel de metodo sobreescribe guard de clase:** Un `@UseGuards()` en un metodo reemplaza (no complementa) el guard definido a nivel de clase, perdiendo JwtAuthGuard
4. **Decorador @Roles() sin @UseGuards(RolesGuard):** El decorador `@Roles()` solo establece metadata; sin RolesGuard que la lea, no tiene efecto y la ruta queda abierta
5. **Guard custom que no extiende AuthGuard:** Un guard personalizado que no invoca `super.canActivate()` no ejecuta la cadena de autenticacion Passport

## Solucion

### 1. Usar el orden correcto: autenticacion ANTES de autorizacion
```typescript
// CORRECTO: JwtAuthGuard primero, luego RolesGuard
@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
export class AssignmentsController {
  // Todos los endpoints de este controller requieren auth + rol
}
```

### 2. Para rutas de admin, usar JwtAuthGuard + AdminGuard
```typescript
// Patron usado en todos los controllers de admin en gamilit
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAnalyticsController {
  // AdminGuard verifica que user.role sea admin o super_admin
}
```

### 3. Para metodos individuales con roles diferentes al controller
```typescript
@Controller('educational')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.STUDENT)  // Default para todo el controller
export class EducationalController {

  @Get('modules')
  // Hereda guards y roles del controller
  async getModules() { ... }

  @Post('modules')
  @Roles(GamilityRoleEnum.ADMIN_TEACHER)  // Override de roles, guards heredados
  async createModule() { ... }

  @Delete('modules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)  // Debe repetir AMBOS guards si override
  @Roles(GamilityRoleEnum.SUPER_ADMIN)
  async deleteModule() { ... }
}
```

### 4. Para WebSocket gateways, usar WsJwtGuard (NO JwtAuthGuard)
```typescript
// Los guards HTTP no funcionan en WebSocket lifecycle hooks
// Usar WsJwtGuard para message handlers
@UseGuards(WsJwtGuard)
@SubscribeMessage('joinRoom')
handleJoinRoom(@ConnectedSocket() client: Socket) {
  // WsJwtGuard valida el token del socket handshake
}

// NOTA: @UseGuards NO funciona en handleConnection (lifecycle hook)
// Validar manualmente en handleConnection
```

### 5. Verificar el flujo de ejecucion
```
Request con JWT
  |
  v
JwtAuthGuard.canActivate()
  -> Valida JWT token
  -> Popula request.user con payload del token
  -> Si invalido: 401 Unauthorized
  |
  v
RolesGuard.canActivate()
  -> Lee @Roles() metadata del handler
  -> Compara request.user.roles con roles requeridos
  -> Si no tiene rol: 403 Forbidden
  |
  v
Controller method ejecuta
```

## Prevencion

1. **Patron consistente a nivel de clase:** Siempre aplicar `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles()` a nivel de clase, no de metodo individual
2. **Orden mnemotecnico:** Auth-then-Authorize (A antes de A, JWT antes de Roles)
3. **No mezclar guards HTTP y WebSocket:** Usar WsJwtGuard para gateways, JwtAuthGuard para controllers
4. **Code review checklist:** Verificar orden de guards en todo PR que modifique controllers
5. **Rutas publicas explicitas:** Usar decorador `@Public()` para rutas que no requieren autenticacion, en lugar de omitir guards

### Checklist para controller nuevo:
- [ ] `@UseGuards(JwtAuthGuard, RolesGuard)` a nivel de clase (en ese orden)
- [ ] `@Roles()` a nivel de clase con roles por defecto
- [ ] Si un metodo necesita roles diferentes, solo override `@Roles()` (no `@UseGuards`)
- [ ] Si un metodo necesita ser publico, usar `@Public()` decorador
- [ ] Verificar que endpoint responde 401 sin token
- [ ] Verificar que endpoint responde 403 con token de rol incorrecto
- [ ] Verificar que endpoint responde 200 con token y rol correcto

### Comando de verificacion
```bash
# Buscar guards en orden potencialmente incorrecto (RolesGuard antes de JwtAuthGuard)
grep -rn "UseGuards(RolesGuard" apps/backend/src --include="*.ts"

# Buscar @Roles sin @UseGuards en el mismo archivo
for f in $(grep -rl "@Roles(" apps/backend/src --include="*.ts"); do
  if ! grep -q "@UseGuards" "$f"; then
    echo "WARNING: @Roles sin @UseGuards en: $f"
  fi
done

# Listar todos los patrones de UseGuards para revision
grep -rn "@UseGuards" apps/backend/src --include="*.ts" | grep -v "node_modules" | sort
```

## Ocurrencias

| Fecha | Controlador | Problema | Estado |
|-------|-------------|----------|--------|
| 2025-11-15 | TeacherReportsController | RolesGuard sin JwtAuthGuard, request.user undefined | Resuelto |
| 2025-12-10 | StudentExercisesController | @Roles() sin @UseGuards(RolesGuard), ruta abierta | Resuelto |
| 2026-01-08 | NotificationsGateway | JwtAuthGuard usado en WebSocket handleConnection (no funciona) | Resuelto: migrado a validacion manual + WsJwtGuard |

## Referencias

- **Guards en gamilit:** `apps/backend/src/modules/auth/guards/` (jwt-auth.guard.ts, roles.guard.ts, admin.guard.ts, ws-jwt.guard.ts)
- **Roles decorator:** `apps/backend/src/shared/decorators/roles.decorator.ts`
- **NestJS Guards:** https://docs.nestjs.com/guards
- **NestJS Execution Context:** https://docs.nestjs.com/fundamentals/execution-context
- **Patron admin controllers:** `apps/backend/src/modules/admin/controllers/` (todos usan JwtAuthGuard + AdminGuard)

---

**Severidad:** Alta (rutas quedan desprotegidas o inaccesibles para usuarios legitimos)
**Frecuencia:** 3+ ocurrencias
**Tiempo de resolucion:** 5-15 min (reordenar decoradores + verificar con curl/Postman)
**Ultimo update:** 2026-02-13
