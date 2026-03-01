---
titulo: Guía de Componentes UI
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# Guía de Componentes UI

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/frontend/src/shared/components/ui/

---

## Resumen

GAMILIT utiliza una librería de componentes UI propios construidos sobre Tailwind CSS y Radix UI primitives. Esta guía documenta los componentes disponibles y cómo utilizarlos.

---

## Stack de UI

- **Tailwind CSS**: Estilos utilitarios
- **Radix UI**: Primitivos accesibles (Dialog, Dropdown, etc.)
- **CVA (class-variance-authority)**: Variantes de componentes
- **Lucide Icons**: Iconografía
- **Sonner**: Toasts/Notificaciones

---

## Componentes Base

### Button

```typescript
import { Button } from '@/shared/components/ui';

// Variantes
<Button variant="primary">Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Peligro</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="md">Mediano</Button>
<Button size="lg">Grande</Button>

// Estados
<Button disabled>Deshabilitado</Button>
<Button isLoading>Cargando...</Button>

// Con icono
<Button>
  <PlusIcon className="w-4 h-4 mr-2" />
  Agregar
</Button>
```

### Input

```typescript
import { Input } from '@/shared/components/ui';

// Básico
<Input placeholder="Escribe aquí..." />

// Con label
<div>
  <label htmlFor="email">Email</label>
  <Input id="email" type="email" />
</div>

// Con error
<Input error="Este campo es requerido" />

// Variantes
<Input variant="filled" />
<Input variant="outlined" />

// Iconos
<Input leftIcon={<SearchIcon />} placeholder="Buscar..." />
<Input rightIcon={<EyeIcon />} type="password" />
```

### Card

```typescript
import { Card, CardHeader, CardBody, CardFooter } from '@/shared/components/ui';

<Card>
  <CardHeader>
    <h3>Título de la tarjeta</h3>
  </CardHeader>
  <CardBody>
    Contenido de la tarjeta...
  </CardBody>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>

// Variantes
<Card variant="elevated">Con sombra</Card>
<Card variant="outlined">Con borde</Card>
<Card variant="filled">Fondo sólido</Card>

// Interactiva
<Card isHoverable onClick={handleClick}>
  Tarjeta clickeable
</Card>
```

> **Truncación de texto:** Todo card que use `line-clamp-N` para truncar texto DEBE incluir el atributo `title=` con el texto completo para tooltip nativo. Ver [ESTANDAR-FRONTEND-CARD-TRUNCATION.md](../../../40-standards/ESTANDAR-FRONTEND-CARD-TRUNCATION.md).

### Badge

```typescript
import { Badge } from '@/shared/components/ui';

// Colores
<Badge>Default</Badge>
<Badge color="success">Completado</Badge>
<Badge color="warning">Pendiente</Badge>
<Badge color="danger">Error</Badge>
<Badge color="info">Nuevo</Badge>

// Tamaños
<Badge size="sm">Pequeño</Badge>
<Badge size="md">Mediano</Badge>

// Con ícono
<Badge>
  <StarIcon className="w-3 h-3 mr-1" />
  Premium
</Badge>
```

### Avatar

```typescript
import { Avatar, AvatarGroup } from '@/shared/components/ui';

// Básico
<Avatar src={user.avatarUrl} alt={user.name} />

// Fallback con iniciales
<Avatar fallback="JD" />

// Tamaños
<Avatar size="sm" src={...} />  {/* 32px */}
<Avatar size="md" src={...} />  {/* 40px */}
<Avatar size="lg" src={...} />  {/* 56px */}

// Grupo de avatares
<AvatarGroup max={3}>
  <Avatar src={user1.avatar} />
  <Avatar src={user2.avatar} />
  <Avatar src={user3.avatar} />
  <Avatar src={user4.avatar} /> {/* +1 */}
</AvatarGroup>
```

---

## Componentes de Formulario

### Select

```typescript
import { Select, SelectOption } from '@/shared/components/ui';

<Select
  label="Categoría"
  value={selected}
  onChange={setSelected}
  placeholder="Selecciona una opción"
>
  <SelectOption value="1">Opción 1</SelectOption>
  <SelectOption value="2">Opción 2</SelectOption>
  <SelectOption value="3">Opción 3</SelectOption>
</Select>
```

### Checkbox

```typescript
import { Checkbox } from '@/shared/components/ui';

<Checkbox
  checked={isChecked}
  onChange={setIsChecked}
  label="Acepto los términos"
/>

// Sin label
<Checkbox checked={...} onChange={...} />
```

### Switch

```typescript
import { Switch } from '@/shared/components/ui';

<Switch
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Notificaciones"
/>
```

### Form Field

```typescript
import { FormField, Input, FormError, FormHelper } from '@/shared/components/ui';

<FormField>
  <label>Email</label>
  <Input type="email" {...register('email')} />
  <FormHelper>Usaremos este email para contactarte</FormHelper>
  {errors.email && <FormError>{errors.email.message}</FormError>}
</FormField>
```

---

## Componentes de Feedback

### Modal / Dialog

```typescript
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/shared/components/ui';

const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Abrir Modal</Button>

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ModalHeader>
    <h2>Confirmar acción</h2>
  </ModalHeader>
  <ModalBody>
    ¿Estás seguro de que deseas continuar?
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Cancelar
    </Button>
    <Button onClick={handleConfirm}>
      Confirmar
    </Button>
  </ModalFooter>
</Modal>
```

### Toast

```typescript
import { toast } from 'sonner';

// Éxito
toast.success('Guardado correctamente');

// Error
toast.error('Ocurrió un error');

// Info
toast.info('Nueva notificación');

// Con acción
toast('Archivo eliminado', {
  action: {
    label: 'Deshacer',
    onClick: () => undoDelete(),
  },
});

// Promesa
toast.promise(saveData(), {
  loading: 'Guardando...',
  success: 'Guardado',
  error: 'Error al guardar',
});
```

### LoadingSpinner

```typescript
import { LoadingSpinner } from '@shared/components/loading';

// Básico
<LoadingSpinner />

// Tamaños
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />

// Centrado en página
<div className="flex items-center justify-center h-screen">
  <LoadingSpinner size="lg" />
</div>
```

### EmptyState

```typescript
import { EmptyState } from '@/shared/components/ui';

<EmptyState
  icon={<InboxIcon className="w-12 h-12" />}
  title="No hay resultados"
  description="No encontramos ejercicios que coincidan con tu búsqueda"
  action={
    <Button onClick={clearFilters}>Limpiar filtros</Button>
  }
/>
```

---

## Componentes de Navegación

### Tabs

```typescript
import { Tabs, TabList, Tab, TabPanel } from '@/shared/components/ui';

<Tabs defaultValue="tab1">
  <TabList>
    <Tab value="tab1">General</Tab>
    <Tab value="tab2">Avanzado</Tab>
    <Tab value="tab3">Configuración</Tab>
  </TabList>

  <TabPanel value="tab1">
    Contenido de General
  </TabPanel>
  <TabPanel value="tab2">
    Contenido de Avanzado
  </TabPanel>
  <TabPanel value="tab3">
    Contenido de Configuración
  </TabPanel>
</Tabs>
```

### Dropdown

```typescript
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/shared/components/ui';

<Dropdown>
  <DropdownTrigger>
    <Button variant="outline">
      Opciones <ChevronDownIcon />
    </Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem onClick={handleEdit}>Editar</DropdownItem>
    <DropdownItem onClick={handleDuplicate}>Duplicar</DropdownItem>
    <DropdownItem onClick={handleDelete} variant="danger">
      Eliminar
    </DropdownItem>
  </DropdownContent>
</Dropdown>
```

### Pagination

```typescript
import { Pagination } from '@/shared/components/ui';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

---

## Componentes de Datos

### Table

```typescript
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/shared/components/ui';

<Table>
  <TableHead>
    <TableRow>
      <TableCell>Nombre</TableCell>
      <TableCell>Email</TableCell>
      <TableCell>Rol</TableCell>
      <TableCell align="right">Acciones</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell><Badge>{user.role}</Badge></TableCell>
        <TableCell align="right">
          <Button size="sm" variant="ghost">Editar</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Progress Bar

```typescript
import { Progress } from '@/shared/components/ui';

// Básico
<Progress value={75} />

// Con label
<Progress value={75} showLabel />

// Colores
<Progress value={100} color="success" />
<Progress value={50} color="warning" />
<Progress value={20} color="danger" />

// XP Progress (específico de GAMILIT)
<XpProgressBar
  currentXp={450}
  maxXp={500}
  level={2}
/>
```

---

## Componentes de GAMILIT

### RankBadge

```typescript
import { RankBadge } from '@/features/gamification';

<RankBadge rank={userRank} />
<RankBadge rank={userRank} size="lg" showName />
```

### MlCoinsDisplay

```typescript
import { MlCoinsDisplay } from '@/features/gamification';

<MlCoinsDisplay coins={250} />
<MlCoinsDisplay coins={250} animated /> // Animación al cambiar
```

### AchievementCard

```typescript
import { AchievementCard } from '@/features/gamification';

<AchievementCard
  achievement={achievement}
  userProgress={userAchievement}
  onClaim={handleClaim}
/>
```

---

## Theming

### Variables CSS

```css
/* shared/styles/variables.css */
:root {
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-secondary: #8b5cf6;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        secondary: 'var(--color-secondary)',
      },
    },
  },
};
```

---

## Buenas Prácticas

1. **Usar componentes base**: No reinventar la rueda
2. **Props consistentes**: Mismos nombres en todos los componentes
3. **Variantes con CVA**: Para componentes con múltiples estilos
4. **Accesibilidad**: Usar ARIA labels y keyboard navigation
5. **Composición**: Preferir composición sobre props complejas
6. **Documentar**: Storybook para documentación visual

---

## Ver También

- [ESTRUCTURA-SHARED.md](./ESTRUCTURA-SHARED.md) - Ubicación de componentes
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Estado en componentes
