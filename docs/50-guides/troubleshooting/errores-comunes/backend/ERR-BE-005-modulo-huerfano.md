# ERR-BE-005: Modulo Sin Registrar en AppModule (Modulo Huerfano)

## Descripcion
Un directorio de modulo NestJS existe en `apps/backend/src/modules/` pero carece de archivo `.module.ts`, o tiene el archivo pero no esta importado en `app.module.ts`. Esto causa que sus providers, controllers y entities no sean accesibles en el contenedor de inyeccion de dependencias.

## Sintomas
- Error: `Nest can't resolve dependencies of the XxxService. Please make sure that the argument "XxxRepository" is available in the current context`
- Error: `Error: Unknown injection token! The requested provider "XxxService" is not registered`
- Entities del modulo no se registran en ningun datasource TypeORM
- Controllers del modulo no exponen endpoints (rutas no aparecen en logs de arranque ni en Swagger)
- Servicios no son inyectables en otros modulos aunque se exporten correctamente
- El directorio tiene archivos `.service.ts`, `.controller.ts`, `.entity.ts` pero no tienen efecto

## Causa Raiz
1. **Archivo .module.ts faltante:** El directorio del modulo fue creado con entities y services pero nunca se creo el archivo `xxx.module.ts` con la clase decorada con `@Module()`
2. **Modulo no importado en AppModule:** El archivo `.module.ts` existe pero no fue agregado al array `imports` de `AppModule` en `app.module.ts`
3. **Modulo creado como placeholder:** El directorio se creo durante planificacion pero la implementacion quedo incompleta
4. **Modulo deshabilitado intencionalmente:** Algunos modulos estan excluidos del AppModule a proposito (ej: modulos en desarrollo, features experimentales) pero esto no esta documentado

## Solucion

### 1. Verificar si el modulo tiene archivo .module.ts
```bash
# Verificar existencia del archivo module
ls apps/backend/src/modules/MI_MODULO/*.module.ts

# Si no existe, crearlo
```

### 2. Crear el archivo .module.ts (si falta)
```typescript
// apps/backend/src/modules/mi-modulo/mi-modulo.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiEntity } from './entities/mi-entity.entity';
import { MiService } from './services/mi.service';
import { MiController } from './controllers/mi.controller';

@Module({
  imports: [
    // Registrar entities en el datasource correcto (ver ERR-BE-004)
    TypeOrmModule.forFeature([MiEntity], 'nombre_datasource'),
  ],
  controllers: [MiController],
  providers: [MiService],
  exports: [MiService], // Exportar si otros modulos necesitan este service
})
export class MiModuloModule {}
```

### 3. Importar en AppModule
```typescript
// app.module.ts
import { MiModuloModule } from './modules/mi-modulo/mi-modulo.module';

@Module({
  imports: [
    // ... datasource configs ...

    // Application modules
    AuthModule,
    EducationalModule,
    // ...
    MiModuloModule,  // Agregar aqui
  ],
})
export class AppModule {}
```

### 4. Asegurar que el datasource incluye los entities del modulo
```typescript
// app.module.ts - datasource correspondiente
TypeOrmModule.forRootAsync({
  name: 'nombre_datasource',
  // ...
  entities: [
    // Agregar glob path para entities del nuevo modulo
    __dirname + '/modules/mi-modulo/entities/**/*.entity{.ts,.js}',
  ],
}),
```

### 5. Para modulos deshabilitados intencionalmente, documentar
```typescript
// app.module.ts - Al final de imports[]
// NOTA: Los siguientes modulos NO estan importados intencionalmente:
// - EtlModule: Modulo ETL para importacion masiva (en desarrollo)
// - LtiModule: Integracion LTI con LMS externos (pendiente)
// - MailModule: Procesamiento de email (integrado en NotificationsModule)
// - MlModule: Machine Learning predictions (en desarrollo)
// - VisualizationModule: Graficos avanzados (pendiente)
```

## Prevencion

1. **Usar NestJS CLI** para generar modulos: `nest g module nombre` crea automaticamente el .module.ts y actualiza AppModule
2. **Verificar imports en AppModule** despues de crear cualquier directorio nuevo en `modules/`
3. **Listar modulos registrados** al inicio del desarrollo con el comando de verificacion
4. **Documentar modulos excluidos** con comentario en AppModule explicando por que no estan importados

### Checklist para nuevo modulo:
- [ ] Directorio creado en `apps/backend/src/modules/`
- [ ] Archivo `.module.ts` existe con decorador `@Module()`
- [ ] `TypeOrmModule.forFeature()` registra entities con datasource correcto
- [ ] Controllers listados en `controllers[]`
- [ ] Services listados en `providers[]`
- [ ] Services necesarios por otros modulos listados en `exports[]`
- [ ] Modulo importado en `app.module.ts`
- [ ] Datasource en `app.module.ts` incluye glob path para entities
- [ ] Aplicacion arranca sin errores (`npm run start:dev`)
- [ ] Endpoints aparecen en logs de arranque de NestJS

### Comando de verificacion
```bash
# Listar directorios de modulos
ls -d apps/backend/src/modules/*/

# Verificar cuales tienen .module.ts
for dir in apps/backend/src/modules/*/; do
  modname=$(basename "$dir")
  if ! ls "$dir"*.module.ts 1>/dev/null 2>&1; then
    echo "SIN .module.ts: $modname"
  fi
done

# Verificar cuales estan importados en AppModule
grep -c "Module," apps/backend/src/app.module.ts
grep "Module" apps/backend/src/app.module.ts | grep "import {" | head -30
```

## Ocurrencias

| Fecha | Modulo | Problema | Estado |
|-------|--------|----------|--------|
| 2026-02-13 | communication | Entities existian pero faltaba .module.ts y datasource | Resuelto: CommunicationModule creado + datasource 'communication' |
| 2026-02-13 | etl | Directorio existe, .module.ts existe, NO importado en AppModule | Intencional: En desarrollo |
| 2026-02-13 | lti | Directorio existe, .module.ts existe, NO importado en AppModule | Intencional: Pendiente integracion LMS |
| 2026-02-13 | mail | Directorio existe, .module.ts existe, NO importado en AppModule | Intencional: Funcionalidad en NotificationsModule |
| 2026-02-13 | ml | Directorio existe, .module.ts existe, NO importado en AppModule | Intencional: En desarrollo |
| 2026-02-13 | visualization | Directorio existe, .module.ts existe, NO importado en AppModule | Intencional: Pendiente |

## Referencias

- **app.module.ts:** `apps/backend/src/app.module.ts` (imports en lineas 332-349)
- **NestJS Modules:** https://docs.nestjs.com/modules
- **ERR-BE-004:** Datasource entity path incorrecto (error relacionado)
- **MEMORY.md:** "5 modules not imported in app.module.ts: etl, lti, mail, ml, visualization"
- **Backend Inventory:** `orchestration/inventarios/BACKEND_INVENTORY.yml`

---

**Severidad:** Alta (funcionalidad completa del modulo inaccesible)
**Frecuencia:** 2 ocurrencias reales + 5 modulos intencionalmente excluidos
**Tiempo de resolucion:** 15-30 min (crear .module.ts + configurar datasource + importar)
**Ultimo update:** 2026-02-13
