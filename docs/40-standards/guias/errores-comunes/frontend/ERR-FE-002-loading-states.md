# ERR-FE-002: Estados de Carga No Manejados

**Categoria:** Frontend
**Severidad:** Media
**Ocurrencias:** 8+
**Fecha documentacion:** 2025-12-28

---

## Descripcion

Componentes que no manejan correctamente los estados de carga (loading),
error y vacio, causando mala experiencia de usuario.

---

## Sintoma

- Pantallas en blanco mientras cargan datos
- Clicks multiples en botones de submit
- Errores de red sin feedback al usuario
- Contenido "parpadea" al cargar

---

## Causa Raiz

Hooks de data fetching sin manejo completo de estados:

```typescript
// PROBLEMATICO: Solo maneja data
const { data } = useQuery(['users'], fetchUsers);
return <UserList users={data} />; // Undefined inicialmente!
```

---

## Solucion

### 1. Manejar todos los estados

```typescript
const { data, isLoading, isError, error } = useQuery(['users'], fetchUsers);

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;
if (!data?.length) return <EmptyState message="No hay usuarios" />;

return <UserList users={data} />;
```

### 2. Usar Suspense boundaries

```typescript
<Suspense fallback={<LoadingSpinner />}>
  <UserList />
</Suspense>
```

### 3. Skeleton loaders para mejor UX

```typescript
if (isLoading) return <UserListSkeleton count={5} />;
```

### 4. Deshabilitar botones durante submit

```typescript
<Button
  disabled={isSubmitting}
  loading={isSubmitting}
>
  {isSubmitting ? 'Guardando...' : 'Guardar'}
</Button>
```

---

## Prevencion

- Template de componente con estados completos
- Code review verificando manejo de loading/error
- Tests de componentes en cada estado

---

## Componentes Reutilizables

- `shared/components/ui/LoadingSpinner.tsx`
- `shared/components/ui/ErrorMessage.tsx`
- `shared/components/ui/EmptyState.tsx`
