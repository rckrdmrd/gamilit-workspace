---
titulo: Guia de Accesibilidad WCAG para React
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [accesibilidad, wcag, react, a11y]
aplica_a: [frontend]
estado: vigente
---

# Guia de Accesibilidad WCAG para React

### 1. Proposito

Implementar WCAG 2.1 nivel AA en los 575 componentes React de gamilit. Esta guia establece
los criterios, patrones y herramientas necesarios para garantizar que la plataforma educativa
sea accesible para todos los estudiantes, incluidos aquellos con discapacidades visuales,
auditivas, motoras o cognitivas.

---

### 2. Criterios WCAG 2.1 AA Prioritarios

| Principio | Criterio | Aplicacion en Gamilit |
|-----------|----------|----------------------|
| Perceptible | 1.1.1 Texto alternativo | Todas las imagenes (avatares, badges, iconos maya) |
| Perceptible | 1.3.1 Info y relaciones | Tablas de leaderboard, formularios |
| Perceptible | 1.4.3 Contraste | Colores maya (verificar ratio 4.5:1) |
| Perceptible | 1.4.4 Redimensionar texto | Zoom 200% sin perdida |
| Operable | 2.1.1 Teclado | Todos los ejercicios interactivos |
| Operable | 2.4.1 Saltar bloques | Skip navigation links |
| Operable | 2.4.7 Foco visible | Focus ring en todos los interactivos |
| Comprensible | 3.1.1 Idioma de pagina | `lang="es"` en HTML |
| Comprensible | 3.3.1 Identificacion de errores | Mensajes claros en formularios |
| Robusto | 4.1.2 Nombre, funcion, valor | ARIA labels en componentes custom |

---

### 3. Patrones React para Accesibilidad

### 3.1 Botones y Links

```tsx
// CORRECTO - usar elementos semanticos
<button onClick={handleSubmit} aria-label="Enviar respuesta del ejercicio">
  <CheckIcon />
</button>

// INCORRECTO - no usar divs como botones
<div onClick={handleSubmit} className="btn">
  <CheckIcon />
</div>
```

**Reglas:**
- Siempre usar `<button>` para acciones y `<a>` para navegacion
- Si el boton solo tiene icono, agregar `aria-label` descriptivo
- Nunca usar `<div>` o `<span>` con `onClick` como sustituto de botones

### 3.2 Formularios

```tsx
// CORRECTO - formulario accesible con labels y mensajes de error
<label htmlFor="answer-input">Tu respuesta:</label>
<input
  id="answer-input"
  type="text"
  aria-describedby="answer-help"
  aria-invalid={!!errors.answer}
  aria-errormessage="answer-error"
/>
{errors.answer && (
  <span id="answer-error" role="alert">
    {errors.answer.message}
  </span>
)}
<span id="answer-help">Escribe tu respuesta en el campo</span>
```

**Reglas:**
- Todo `<input>` debe tener un `<label>` asociado con `htmlFor`
- Usar `aria-describedby` para texto de ayuda adicional
- Usar `aria-invalid` y `aria-errormessage` para errores
- Los mensajes de error deben tener `role="alert"` para ser anunciados

### 3.3 Tablas (Leaderboard)

```tsx
<table aria-label="Tabla de posiciones del leaderboard">
  <caption>Rankings de la semana</caption>
  <thead>
    <tr>
      <th scope="col">Posicion</th>
      <th scope="col">Estudiante</th>
      <th scope="col">XP</th>
      <th scope="col">Rango Maya</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Juan Perez</td>
      <td>2,450</td>
      <td>Ahau</td>
    </tr>
  </tbody>
</table>
```

**Reglas:**
- Usar `<caption>` para describir el contenido de la tabla
- Usar `scope="col"` en encabezados de columna y `scope="row"` en encabezados de fila
- Agregar `aria-label` si la tabla no tiene `<caption>`

### 3.4 Navegacion por Teclado en Ejercicios

```tsx
// Ejercicio de seleccion multiple - navegable por teclado
<div role="radiogroup" aria-label="Opciones de respuesta">
  {options.map((opt, i) => (
    <label key={opt.id}>
      <input
        type="radio"
        name="answer"
        value={opt.id}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') focusNext(i);
          if (e.key === 'ArrowUp') focusPrev(i);
        }}
      />
      {opt.text}
    </label>
  ))}
</div>
```

**Reglas:**
- Los 30 tipos de ejercicios interactivos deben ser completamente operables con teclado
- Implementar navegacion con flechas (ArrowUp/ArrowDown) en listas de opciones
- Tab para moverse entre secciones, Enter/Space para seleccionar
- Esc para cancelar o cerrar modales

### 3.5 Anuncios Dinamicos (XP, Logros)

```tsx
// Anunciar cambios de XP a screen readers
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {xpMessage && `Has ganado ${xpAmount} puntos de experiencia`}
</div>

// Anunciar logros desbloqueados (urgente)
<div aria-live="assertive" role="alert" className="sr-only">
  {achievement && `Logro desbloqueado: ${achievement.name}`}
</div>
```

**Reglas:**
- Usar `aria-live="polite"` para actualizaciones no urgentes (XP ganado, progreso)
- Usar `aria-live="assertive"` para eventos importantes (logros, errores)
- La clase `sr-only` oculta visualmente pero mantiene accesible para screen readers
- Usar `aria-atomic="true"` para anunciar el contenido completo de la region

### 3.6 Modales y Dialogos

```tsx
// Modal accesible con focus trap
<dialog
  ref={dialogRef}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  onKeyDown={(e) => {
    if (e.key === 'Escape') closeModal();
  }}
>
  <h2 id="modal-title">Logro Desbloqueado</h2>
  <p id="modal-description">Has alcanzado el rango de Ahau</p>
  <button onClick={closeModal} aria-label="Cerrar modal">X</button>
</dialog>
```

**Reglas:**
- Usar el elemento nativo `<dialog>` cuando sea posible
- Implementar focus trap (el foco no debe salir del modal)
- Restaurar el foco al elemento que abrio el modal al cerrarlo
- Permitir cierre con tecla Escape

---

### 4. Contraste de Colores

### Ratios Minimos

| Tipo de Texto | Ratio Minimo WCAG AA |
|---------------|---------------------|
| Texto normal (<18px) | 4.5:1 |
| Texto grande (>=18px o >=14px bold) | 3:1 |
| Componentes UI (bordes, iconos) | 3:1 |

### Colores Tematicos Maya

Verificar que los colores del tema maya cumplan con los ratios minimos:
- Fondos oscuros con texto claro: ratio >= 4.5:1
- Colores de acento (XP dorado, rangos) contra fondo: ratio >= 3:1
- Badges e iconos maya: suficiente contraste contra fondo

### Herramientas de Verificacion

- **Chrome DevTools:** Panel Accessibility > Contrast ratio
- **axe-core:** Extension de navegador para auditorias automaticas
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/

### Clase Utilitaria sr-only

```css
/* Texto solo visible para screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Tailwind CSS incluye esta clase por defecto como `sr-only`.

---

### 5. Focus Management

### Focus Visible

Todo elemento interactivo debe tener un indicador de foco visible:

```tsx
// Tailwind CSS - focus ring consistente
<button className="focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none">
  Enviar
</button>

// Para elementos custom
<div
  tabIndex={0}
  role="button"
  className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
>
  Elemento interactivo
</div>
```

### Focus Trap en Modales

```tsx
import { useEffect, useRef } from 'react';

function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);
    return () => containerRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return containerRef;
}
```

### Restauracion de Foco

```tsx
// Al cerrar un modal, restaurar foco al boton que lo abrio
const triggerRef = useRef<HTMLButtonElement>(null);

const openModal = () => {
  setIsOpen(true);
};

const closeModal = () => {
  setIsOpen(false);
  triggerRef.current?.focus(); // Restaurar foco
};
```

---

### 6. Testing de Accesibilidad

### Tests Automaticos con axe-core

```bash
# Instalar axe-core para tests automaticos
npm install -D @axe-core/playwright
```

```typescript
// En tests de Playwright
import AxeBuilder from '@axe-core/playwright';

test('portal estudiante no tiene violaciones a11y', async ({ page }) => {
  await page.goto('/student/dashboard');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('ejercicios interactivos son accesibles', async ({ page }) => {
  await page.goto('/student/modules/1/exercises/1');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .exclude('.third-party-widget') // Excluir widgets externos si los hay
    .analyze();
  expect(results.violations).toEqual([]);
});

test('leaderboard tiene tabla accesible', async ({ page }) => {
  await page.goto('/student/leaderboard');
  const results = await new AxeBuilder({ page })
    .include('table')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Tests Manuales Recomendados

| Test | Como Verificar |
|------|---------------|
| Navegacion por teclado | Tab a traves de toda la pagina sin mouse |
| Screen reader | Activar NVDA/VoiceOver y navegar la pagina |
| Zoom 200% | Ctrl+= hasta 200% - verificar que nada se rompe |
| Alto contraste | Activar modo alto contraste del SO |
| Sin imagenes | Desactivar imagenes - verificar que todo tiene alt text |

### Integracion en CI/CD

```yaml
# En el pipeline de GitHub Actions (ver GUIA-GITHUB-ACTIONS-CICD.md)
- name: Tests de accesibilidad
  run: npx playwright test --grep @a11y
```

---

### 7. Componentes Prioritarios para a11y

### Prioridad Alta (impacto directo en aprendizaje)

| Componente | Tipo | Requisitos a11y Clave |
|------------|------|----------------------|
| Ejercicios interactivos (30 tipos) | Mecanica | Navegacion completa por teclado |
| Dashboard de gamificacion | Vista | Anuncios de XP/logros con aria-live |
| Leaderboard | Vista | Tablas accesibles con scope y caption |
| Formularios de login/registro | Form | Validacion accesible, labels |
| Tienda virtual | Vista | Items navegables por teclado |

### Prioridad Media (funcionalidad complementaria)

| Componente | Tipo | Requisitos a11y Clave |
|------------|------|----------------------|
| Notificaciones | Sistema | aria-live regions |
| Perfil de estudiante | Vista | Formularios accesibles |
| Progreso del modulo | Vista | Barras de progreso con aria-valuenow |
| Chat/mensajeria | Social | aria-live para mensajes nuevos |

### Prioridad Baja (administracion)

| Componente | Tipo | Requisitos a11y Clave |
|------------|------|----------------------|
| Portal admin | Vista | Tablas y formularios accesibles |
| Reportes | Vista | Graficas con texto alternativo |
| Configuracion | Form | Labels y descripciones |

---

### 8. Checklist WCAG para Componentes Nuevos

Antes de marcar un componente como completado, verificar:

- [ ] Semantica HTML correcta (no `<div>` como boton)
- [ ] `aria-label` en elementos sin texto visible
- [ ] `alt` en todas las imagenes
- [ ] Contraste 4.5:1 verificado
- [ ] Navegable por teclado (Tab, Enter, Space, Arrow keys)
- [ ] Focus visible en estado `:focus-visible`
- [ ] Mensajes de error asociados con `aria-describedby`
- [ ] Contenido dinamico con `aria-live`
- [ ] Modales con focus trap y cierre por Escape
- [ ] Tablas con `<caption>`, `<th>` y `scope`
- [ ] Idioma de pagina declarado (`lang="es"`)
- [ ] Funcional con zoom al 200%
- [ ] Test axe-core sin violaciones WCAG AA

---

### 9. Patrones Especificos de Gamilit

### Barras de Progreso (XP, Modulos)

```tsx
<div
  role="progressbar"
  aria-valuenow={currentXP}
  aria-valuemin={0}
  aria-valuemax={maxXP}
  aria-label={`Progreso: ${currentXP} de ${maxXP} XP`}
>
  <div style={{ width: `${(currentXP / maxXP) * 100}%` }} />
</div>
```

### Rangos Maya (Badges)

```tsx
<img
  src={rangoIcon}
  alt={`Rango maya: ${rangoName} - Nivel ${rangoLevel}`}
  title={rangoDescription}
/>
```

### Temporizadores en Ejercicios

```tsx
<div
  role="timer"
  aria-live="off" // No anunciar cada segundo
  aria-label={`Tiempo restante: ${minutes}:${seconds}`}
>
  {formatTime(timeRemaining)}
</div>
// Anunciar solo cuando queda poco tiempo
{timeRemaining <= 30 && (
  <div aria-live="assertive" className="sr-only">
    Quedan {timeRemaining} segundos
  </div>
)}
```

---

## Patrones ARIA Implementados (Wave 9 — Feb 2026)

Cobertura actual tras Wave 9 de accesibilidad (51 paginas, 4 portales):

| Patron ARIA | Ocurrencias | Archivos | Uso |
|-------------|-------------|----------|-----|
| `role="alert"` | 46 | 34 | Error states, validacion |
| `aria-live="polite"` | 56 | 39 | Loading states, contenido dinamico |
| `role="region"` + `aria-label` | 42 | 30 | Secciones semanticas |
| `role="tablist"` + `role="tab"` + `aria-selected` | — | 6 | Tab navigation |
| `aria-hidden="true"` | 15 | 10 | Iconos decorativos |
| `sr-only` (clase CSS) | 17 | 15 | Texto solo para screen readers |

### Gaps Conocidos (Backlog)

- **aria-hidden underuse:** Iconos decorativos sin `aria-hidden="true"` en ~20 componentes adicionales
- **sr-only underuse:** Faltan labels `sr-only` en algunos botones icon-only (~10 instancias)
- **Redundancia corregida:** `role="status"` + `aria-live="polite"` eliminada en 3 paginas admin (role="status" implica aria-live="polite" segun WAI-ARIA spec)

---

### 10. Referencias

- **WCAG 2.1 Quick Reference:** https://www.w3.org/WAI/WCAG21/quickref/
- **React Accessibility:** https://react.dev/reference/react-dom/components#form-components
- **axe-core:** https://www.deque.com/axe/
- **WAI-ARIA Practices:** https://www.w3.org/WAI/ARIA/apg/
- **Tailwind sr-only:** https://tailwindcss.com/docs/screen-readers

### Estandares relacionados del proyecto

- [`ESTANDAR-FRONTEND-UX-PATTERNS.md`](../../40-standards/ESTANDAR-FRONTEND-UX-PATTERNS.md) -- Error/Loading/Empty states, toasts, confirmation dialogs
- [`ESTANDAR-FRONTEND-COMPONENT.md`](../../40-standards/ESTANDAR-FRONTEND-COMPONENT.md) -- Props typing, export patterns, file naming
- [`ESTANDAR-FRONTEND-PROFESIONAL.md`](../../40-standards/ESTANDAR-FRONTEND-PROFESIONAL.md) -- Compound components, performance, testing

---

*Ultima actualizacion: 2026-02-21*
