---
titulo: Error BE-006 Dependencia Circular entre Módulos
tipo: guia
dominio: troubleshooting
ultima_actualizacion: 2026-02-27
---

# ERR-BE-006: Dependencia Circular entre Modulos

### Descripcion
Dos o mas modulos NestJS se importan mutuamente creando un ciclo de dependencia. TypeORM y el contenedor de inyeccion de NestJS no pueden resolver el orden de inicializacion, causando errores en tiempo de arranque o valores `undefined` en tiempo de ejecucion.

### Sintomas
- Error: `Nest cannot resolve dependencies of the XxxService (?). Please make sure that the argument dependency at index [N] is available in the XxxModule context`
- Error: `TypeError: Cannot read properties of undefined (reading 'someMethod')` al invocar un service inyectado
- Warning en consola: `A circular dependency has been detected`
- La aplicacion arranca pero metodos de un service inyectado son `undefined` en runtime
- Tests unitarios pasan pero tests de integracion o e2e fallan con errores de dependencia
- Hot reload se rompe intermitentemente durante desarrollo

### Causa Raiz
1. **Importacion mutua directa:** ModuleA importa ModuleB y ModuleB importa ModuleA en sus respectivos `imports[]`
2. **Inyeccion circular de services:** ServiceA depende de ServiceB y ServiceB depende de ServiceA sin usar `forwardRef()`
3. **Relaciones bidireccionales de TypeORM:** Entity A referencia Entity B y viceversa, forzando que ambos modulos se importen mutuamente para resolver repositories
4. **Acoplamiento excesivo:** Demasiada logica compartida entre dos modulos que deberia estar en un modulo comun

### Solucion

### 1. Usar forwardRef() para inyeccion circular de services
```typescript
// gamification/services/ml-coins.service.ts
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { RankMultiplierService } from './rank-multiplier.service';

@Injectable()
export class MlCoinsService {
  constructor(
    @Inject(forwardRef(() => RankMultiplierService))
    private readonly rankMultiplierService: RankMultiplierService,
  ) {}
}
```

### 2. Usar forwardRef() a nivel de modulo
```typescript
// peer-challenges/peer-challenges.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { SocialModule } from '../social/social.module';

@Module({
  imports: [
    // forwardRef() rompe el ciclo de dependencia
    forwardRef(() => SocialModule),
  ],
  // ...
})
export class PeerChallengesModule {}
```

### 3. Extraer logica compartida a un tercer modulo
```typescript
// ANTES: Circular
// ModuleA imports ModuleB (para usar SharedService)
// ModuleB imports ModuleA (para usar SharedService)

// DESPUES: Sin circular
// shared/shared.module.ts
@Module({
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}

// ModuleA y ModuleB solo importan SharedModule
@Module({
  imports: [SharedModule],
})
export class ModuleA {}
```

### 4. Usar eventos para desacoplar (patron preferido para logica compleja)
```typescript
// gamification/services/xp.service.ts
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class XpService {
  constructor(private eventEmitter: EventEmitter2) {}

  async grantXp(studentId: string, amount: number) {
    // En lugar de llamar directamente a ProgressService
    this.eventEmitter.emit('xp.granted', { studentId, amount });
  }
}

// progress/listeners/xp.listener.ts
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class XpListener {
  constructor(private progressService: ProgressService) {}

  @OnEvent('xp.granted')
  handleXpGranted(payload: { studentId: string; amount: number }) {
    this.progressService.updateProgress(payload.studentId, payload.amount);
  }
}
```

### 5. Verificar que la dependencia circular esta resuelta
```bash
# Arrancar la aplicacion y buscar warnings
npm run start:dev 2>&1 | grep -i "circular"

# Si no hay output, la dependencia circular esta resuelta
```

### Prevencion

1. **Diseno modular unidireccional:** Definir una jerarquia clara donde modulos de nivel inferior no dependan de modulos de nivel superior
2. **Usar eventos** para comunicacion entre modulos del mismo nivel en lugar de inyeccion directa
3. **Extraer interfaces** a un modulo compartido cuando dos modulos necesitan conocerse mutuamente
4. **Revisar imports** antes de agregar una nueva dependencia entre modulos: verificar que no se crea un ciclo
5. **Preferir composicion sobre herencia** en la organizacion de modulos

### Jerarquia recomendada de modulos gamilit:
```
Nivel 0 (Core):     auth, core, health
Nivel 1 (Domain):   educational, progress, social, content, teacher
Nivel 2 (Features): gamification, assignments, notifications, communication
Nivel 3 (Compound): admin, parents, websocket, tasks, audit
```
Regla: Un modulo solo puede importar modulos de su nivel o inferior, nunca de nivel superior.

### Checklist para nueva dependencia entre modulos:
- [ ] Verificar que no se crea ciclo: ModA -> ModB -> ... -> ModA
- [ ] Si hay ciclo, evaluar: forwardRef() vs extraer a modulo comun vs eventos
- [ ] Si se usa forwardRef(), documentar con comentario explicativo
- [ ] Probar arranque sin warnings de circular dependency
- [ ] Probar que hot reload funciona correctamente

### Comando de verificacion
```bash
# Buscar uso actual de forwardRef (indica dependencias circulares resueltas)
grep -rn "forwardRef" apps/backend/src --include="*.ts"

# Buscar warnings de circular dependency en arranque
cd apps/backend && npm run start:dev 2>&1 | head -50 | grep -i "circular"

# Contar forwardRef por modulo para identificar modulos con mas dependencias circulares
grep -rl "forwardRef" apps/backend/src --include="*.ts" | \
  sed 's|.*/modules/||' | sed 's|/.*||' | sort | uniq -c | sort -rn
```

### Ocurrencias

| Fecha | Modulos Involucrados | Tipo de Circular | Estado |
|-------|---------------------|-----------------|--------|
| 2026-01-15 | gamification <-> gamification (MlCoinsService <-> RankMultiplierService) | Service-level forwardRef | Resuelto: forwardRef() en ml-coins.service.ts |
| 2026-01-20 | peer-challenges <-> social | Module-level forwardRef | Resuelto: forwardRef(() => SocialModule) en peer-challenges.module.ts |
| 2026-01-22 | gamification/peer-challenges (MatchmakingService <-> PeerChallengesService) | Service-level forwardRef | Resuelto: forwardRef() en matchmaking.service.ts |
| 2026-01-22 | gamification/peer-challenges (BattleSessionService <-> PeerChallengesService, ChallengeParticipantsService) | Service-level forwardRef (2x) | Resuelto: doble forwardRef() en battle-session.service.ts |
| 2026-01-28 | progress (ModuleProgressService <-> CertificateService) | Service-level forwardRef | Resuelto: forwardRef() en module-progress.service.ts |

### Referencias

- **NestJS Circular Dependency:** https://docs.nestjs.com/fundamentals/circular-dependency
- **NestJS Events:** https://docs.nestjs.com/techniques/events
- **forwardRef usage en gamilit:** Buscar `grep -rn "forwardRef" apps/backend/src`
- **app.module.ts:** `apps/backend/src/app.module.ts` (jerarquia de imports)

---

**Severidad:** Alta (puede ser bloqueador de arranque o causar bugs silenciosos en runtime)
**Frecuencia:** 3+ ocurrencias (5 instancias de forwardRef documentadas en codebase)
**Tiempo de resolucion:** 15-45 min (identificar ciclo + elegir estrategia + implementar + validar)
**Ultimo update:** 2026-02-13
