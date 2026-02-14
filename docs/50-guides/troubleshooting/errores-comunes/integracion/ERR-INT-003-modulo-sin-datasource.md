# ERR-INT-003: Modulo Registrado sin Entidades en Datasource

## Descripcion
Un modulo NestJS esta importado en `app.module.ts` pero sus entidades no estan incluidas en ninguno de los 10 datasources de TypeORM, causando errores de metadata al intentar inyectar repositorios. Con 152 entities distribuidas en 10 datasources, es facil omitir la configuracion de entities al agregar o mover modulos.

## Sintomas
- Error: `No metadata for "EntityName" was found. Entity metadata was not found.`
- Error: `Repository "EntityName" was not found. Was it imported within a module that is connected to a TypeORM DataSource?`
- Error: `Cannot find metadata for "EntityName". Make sure the entity is registered in the module.`
- El modulo se importa sin errores pero cualquier operacion de base de datos falla en runtime
- Los tests unitarios pasan (mocks) pero los tests de integracion fallan
- El `npm run build` compila exitosamente porque es un error de configuracion, no de tipado

## Causa Raiz
1. Se crea un nuevo modulo con entidades pero no se agregan los paths de entidades al datasource correspondiente en `app.module.ts`
2. Se mueve una entidad de un modulo a otro sin actualizar el array `entities` del datasource
3. El modulo tiene un `.module.ts` que importa `TypeOrmModule.forFeature([Entity])` pero la entidad no esta en el datasource global
4. Confusion sobre CUAL de los 10 datasources debe contener la entidad (cada schema de PostgreSQL tiene su propio datasource)

## Solucion

### 1. Identificar el datasource correcto
```typescript
// app.module.ts tiene 10 datasources, cada uno para un schema de PostgreSQL:
// Verificar en que schema esta la tabla de la entidad

// Ejemplo: si la tabla esta en schema 'educational'
// → usar el datasource 'educationalDataSource'
```

### 2. Verificar la configuracion actual del datasource
```bash
cd apps/backend

# Buscar el datasource del schema correspondiente en app.module.ts
grep -A 20 "educationalDataSource\|name: 'educational'" src/app.module.ts
```

### 3. Agregar la entidad al datasource
```typescript
// En app.module.ts, dentro de TypeOrmModule.forRoot({...}) del datasource correspondiente:

// ANTES: entidad faltante
TypeOrmModule.forRoot({
  name: 'educationalDataSource',
  // ...
  entities: [
    __dirname + '/modules/educational/entities/*.entity{.ts,.js}',
    // Falta: modules/nuevo-modulo/entities/
  ],
}),

// DESPUES: entidad incluida
TypeOrmModule.forRoot({
  name: 'educationalDataSource',
  // ...
  entities: [
    __dirname + '/modules/educational/entities/*.entity{.ts,.js}',
    __dirname + '/modules/nuevo-modulo/entities/*.entity{.ts,.js}',
  ],
}),
```

### 4. Verificar que el modulo usa forFeature con el datasource correcto
```typescript
// En el modulo que contiene la entidad:
@Module({
  imports: [
    // INCORRECTO: sin especificar datasource (usa default)
    TypeOrmModule.forFeature([MiEntity]),

    // CORRECTO: especifica el datasource
    TypeOrmModule.forFeature([MiEntity], 'educationalDataSource'),
  ],
})
export class MiModulo {}
```

### 5. Verificar que el servicio inyecta el repositorio del datasource correcto
```typescript
// En el servicio:
@Injectable()
export class MiService {
  constructor(
    // INCORRECTO: sin datasource
    @InjectRepository(MiEntity)
    private readonly repo: Repository<MiEntity>,

    // CORRECTO: con datasource especificado
    @InjectRepository(MiEntity, 'educationalDataSource')
    private readonly repo: Repository<MiEntity>,
  ) {}
}
```

### 6. Verificar que funciona
```bash
cd apps/backend && npm run build && npm run test
```

## Prevencion

1. **Mapa de datasources**: Mantener documentado que schemas y modulos pertenecen a cada datasource
2. **Checklist de modulo nuevo**: Incluir paso de "agregar entities a datasource" en el checklist
3. **Test de integracion**: Al crear modulo nuevo, probar que el repositorio se inyecta correctamente
4. **Auditoria periodica**: Comparar entidades registradas en datasources vs archivos `.entity.ts` en disco

### Mapa de datasources (referencia rapida):
```
defaultDataSource    → auth_management, gamilit
educationalDataSource → educational
gamificationDataSource → gamification
progressDataSource   → progress
tenantDataSource     → tenant_management
socialDataSource     → social
communicationDataSource → communication
analyticsDataSource  → analytics
contentDataSource    → content_management
configDataSource     → system_config
```

### Checklist al crear modulo nuevo con entidades:
- [ ] Entity creada en `modules/{modulo}/entities/{entity}.entity.ts`
- [ ] Entity path agregado al datasource correcto en `app.module.ts`
- [ ] `TypeOrmModule.forFeature([Entity], 'datasourceName')` en el modulo
- [ ] `@InjectRepository(Entity, 'datasourceName')` en los servicios
- [ ] `npm run build` exitoso
- [ ] Test de integracion: repositorio se inyecta y puede hacer query

### Verificacion automatica
```bash
# Listar entities que existen como archivos pero no estan en ningun datasource
cd apps/backend
entity_files=$(find src/modules -name "*.entity.ts" -not -path "*spec*" | sort)
for ef in $entity_files; do
  module_dir=$(echo "$ef" | sed 's|src/modules/\([^/]*\)/.*|\1|')
  if ! grep -q "$module_dir" src/app.module.ts; then
    echo "POSIBLE FALTANTE: $ef (directorio '$module_dir' no encontrado en app.module.ts)"
  fi
done
```

## Ocurrencias

| Fecha | Modulo | Entity | Datasource Faltante | Estado |
|-------|--------|--------|---------------------|--------|
| 2026-01-28 | communication | Message, Conversation | communicationDataSource | Documentado |
| 2026-01-10 | social | TeamMember | socialDataSource | Resuelto |
| 2025-12-22 | gamification | Achievement | gamificationDataSource | Resuelto |

## Referencias

- **app.module.ts:** `apps/backend/src/app.module.ts`
- **Inventario Backend:** `orchestration/inventarios/BACKEND_INVENTORY.yml`
- **TypeORM Multiple Datasources:** https://typeorm.io/multiple-data-sources
- **MEMORY.md:** "communication module has entities but NO .module.ts and entities NOT in datasource"
- **ERR-INT-001:** Desalineacion DB-Backend (complementario)

---

**Severidad:** Critica
**Frecuencia:** 3+ ocurrencias
**Tiempo de resolucion:** 15-30 min
**Ultimo update:** 2026-02-13
