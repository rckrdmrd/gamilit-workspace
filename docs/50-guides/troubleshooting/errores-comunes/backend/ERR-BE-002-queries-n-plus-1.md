# ERR-BE-002: Queries N+1 en TypeORM

**Categoria:** Backend
**Severidad:** Alta
**Ocurrencias:** 5+
**Fecha documentacion:** 2025-12-28

---

## Descripcion

Las queries N+1 ocurren cuando se obtiene una lista de entidades y luego
se ejecuta una query adicional por cada elemento para cargar relaciones.

---

## Sintoma

- Endpoints lentos (>500ms) al listar entidades con relaciones
- Alto numero de queries en logs de BD
- Performance degradada con mas registros

---

## Causa Raiz

TypeORM con lazy loading ejecuta query por cada acceso a relacion.

```typescript
// PROBLEMATICO: N+1 queries
const users = await userRepository.find();
for (const user of users) {
  console.log(user.profile.name); // Query adicional por usuario
}
```

---

## Solucion

### 1. Usar relations en find()

```typescript
// CORRECTO: 2 queries totales
const users = await userRepository.find({
  relations: ['profile', 'roles'],
});
```

### 2. Usar QueryBuilder con joins

```typescript
// CORRECTO: 1 query con JOINs
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.profile', 'profile')
  .leftJoinAndSelect('user.roles', 'roles')
  .getMany();
```

### 3. Usar eager loading en entity (con cuidado)

```typescript
@ManyToOne(() => Profile, { eager: true })
profile: Profile;
```

---

## Prevencion

- Revisar queries en desarrollo con logging habilitado
- Usar herramientas de profiling
- Code review enfocado en acceso a relaciones

---

## Referencias

- TypeORM Documentation: Relations
- Patron: Repository con metodos especificos para cada caso de uso
