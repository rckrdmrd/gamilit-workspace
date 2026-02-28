---
titulo: Patron Repository (Acceso a Datos) en NestJS
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [patrones, gof, nestjs, typescript, repository, data-access]
aplica_a: [backend]
estado: vigente
origen: GUIA-DESIGN-PATTERNS-NESTJS.md
seccion: "Seccion 9"
---

# Patron Repository (Acceso a Datos) en NestJS

> **Aplica a:** `apps/backend/src/` | **Stack:** NestJS 11, TypeORM 0.3.x, TypeScript 5.x

---

## 9. Repository Pattern

**Categoria GoF:** Estructural (tambien considerado patron de arquitectura)

**Descripcion:** El patron Repository abstrae la capa de acceso a datos, proporcionando una interfaz de coleccion para acceder a objetos de dominio. Encapsula la logica de persistencia (SQL, NoSQL, cache) detras de una interfaz limpia.

> **Documentacion completa:** Este patron esta documentado en detalle en
> `docs/40-standards/backend-profesional/03-repository-pattern.md`, que cubre:
> - Interfaz base generica (`IRepository<T, ID>`)
> - Interfaces especificas con metodos de dominio
> - Implementacion con TypeORM
> - Specification pattern para consultas complejas
> - Unit of Work pattern
> - Testing de repositories
>
> Consultar ese documento para la referencia completa.

### Resumen Rapido

```typescript
// Interfaz (puerto secundario)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// Implementacion (adaptador secundario)
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}
  // ... implementacion
}

// Registro en modulo
@Module({
  providers: [
    { provide: 'IUserRepository', useClass: TypeOrmUserRepository },
  ],
})
```

En gamilit, 156 entity files (157 classes) mapean a repositories via TypeORM `Repository<Entity>`, organizados en 11 datasources (uno por schema de PostgreSQL).
