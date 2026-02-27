---
titulo: "ADR-049: ConfirmDialog Consolidation"
tipo: adr
fecha_creacion: "2026-02-21"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-049: ConfirmDialog Consolidation

**Estado:** Aceptada
**Date:** 2026-02-21
**Deciders:** Frontend Team
**Tags:** frontend, components, ux, accessibility, confirm-dialog, shared

---

## Context

### Situacion Anterior

The GAMILIT frontend used three different approaches for confirmation and alert flows across its 4 portals and 575 production components:

1. **Native `window.confirm()` calls:** Used in 20+ locations across all portals for destructive actions (delete classroom, remove student, cancel mission, etc.). These produce browser-native dialogs that are unstyled, inaccessible to screen readers in some browsers, and block the JavaScript thread.

2. **Native `window.alert()` calls:** Used for success/error notifications in several components. These produce blocking dialogs that cannot be styled or dismissed programmatically.

3. **Custom `ConfirmDialog` component:** A properly themed confirmation dialog existed in `shared/components/common/ConfirmDialog.tsx` with variant support (danger, warning, info, success), loading state, and integration with the shared `Modal` component. However, it was underutilized — most developers defaulted to `window.confirm()` out of convenience.

Additionally, a duplicate `ConfirmDialog` previously existed in `shared/components/feedback/ConfirmDialog.tsx` (now deleted). The existence of two ConfirmDialog files at different paths caused import confusion and contributed to developers avoiding both in favor of the native API.

### Problemas Identificados

1. **Inconsistent UX:** Users encountered three different confirmation experiences depending on which portal and feature they used: unstyled browser dialogs, the themed ConfirmDialog, or no confirmation at all.

2. **Accessibility issues:** Native `confirm()` and `alert()` have limited accessibility support — no keyboard navigation within the dialog, no focus trapping, and the dialog appearance varies by browser and operating system.

3. **No loading state:** Native `confirm()` returns immediately. There is no way to show a "Processing..." state while the async action (e.g., deleting a record) completes. Users could double-click or navigate away during the operation.

4. **Thread blocking:** Native `confirm()` and `alert()` block the JavaScript event loop, preventing WebSocket messages, animations, and other UI updates from processing while the dialog is open.

5. **Cannot match design system:** The detective/maya theme used throughout GAMILIT cannot be applied to native browser dialogs. The transition from a themed UI to an unstyled browser dialog and back is jarring.

6. **No variant support:** Native `confirm()` cannot distinguish between a destructive action (red/danger) and a cautionary action (yellow/warning). All confirmations look identical.

### Componente Existente

The canonical `ConfirmDialog` at `shared/components/common/ConfirmDialog.tsx` already solves these problems:

```typescript
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;    // Default: 'Confirmar'
  cancelText?: string;     // Default: 'Cancelar'
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}
```

It provides:
- **4 variants** with distinct colors and icons (XCircle for danger, AlertTriangle for warning, Info for info, CheckCircle for success).
- **Loading state** with spinner animation and "Procesando..." text.
- **Modal integration** via the shared `Modal` component, which provides focus trapping, escape-to-close, and overlay click handling.
- **Accessible markup** with proper heading hierarchy and button focus management.
- **Disabled interactions** during loading (buttons disabled, overlay click blocked, escape blocked).

---

## Decision

**All confirmation flows use `shared/components/common/ConfirmDialog`. All notification alerts use `react-hot-toast`. Native `window.confirm()` and `window.alert()` are prohibited in new code.**

### Regla 1: Confirmations use ConfirmDialog

Any action that requires user confirmation before proceeding (delete, cancel, leave page, irreversible action) must use the `ConfirmDialog` component:

```typescript
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog';

function ClassroomSettings() {
  const [showDelete, setShowDelete] = useState(false);
  const deleteMutation = useDeleteClassroom();

  return (
    <>
      <button onClick={() => setShowDelete(true)}>
        Eliminar Aula
      </button>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate(classroomId)}
        variant="danger"
        title="Eliminar Aula"
        message="Esta accion eliminara el aula y todos sus datos permanentemente. ¿Deseas continuar?"
        confirmText="Eliminar"
        loading={deleteMutation.isPending}
      />
    </>
  );
}
```

### Regla 2: Variant selection follows severity

| Action Type | Variant | Example |
|-------------|---------|---------|
| Destructive (delete, remove, revoke) | `danger` | Delete classroom, remove student, revoke access |
| Cautionary (cancel, override, bulk action) | `warning` | Cancel mission, override grade, bulk status change |
| Informational (acknowledge, proceed) | `info` | Acknowledge terms, proceed with navigation |
| Positive (confirm completion, approve) | `success` | Approve submission, confirm enrollment |

### Regla 3: Alerts use react-hot-toast

Success and error notifications that do not require user action should use `react-hot-toast` (already installed in the project) instead of `window.alert()`:

```typescript
import toast from 'react-hot-toast';

// Success notification
toast.success('Aula creada exitosamente');

// Error notification
toast.error('Error al eliminar el aula. Intenta de nuevo.');

// Custom notification
toast('Cambios guardados', { icon: '💾' });
```

### Regla 4: No native dialogs in new code

`window.confirm()`, `window.alert()`, and `window.prompt()` are prohibited in new code. ESLint rule `no-restricted-globals` should be configured to warn on these calls (backlog item — not yet enforced by linting).

### Regla 5: Incremental migration of existing calls

Existing `window.confirm()` and `window.alert()` calls should be replaced when the file is modified for other reasons. A dedicated migration sprint is not required, as the existing calls are functional (just inconsistent). Priority for migration:

1. **High priority:** Destructive actions in Teacher and Admin portals (data loss risk).
2. **Medium priority:** Student portal confirmations (UX consistency).
3. **Low priority:** Parent portal (fewer interactive actions).

### Duplicate Cleanup

The duplicate `ConfirmDialog` that previously existed at `shared/components/feedback/ConfirmDialog.tsx` has been deleted. Only one canonical implementation exists:

- **Canonical:** `shared/components/common/ConfirmDialog.tsx`
- **Deleted:** ~~`shared/components/feedback/ConfirmDialog.tsx`~~

All imports must reference the canonical path.

---

## Alternatives Considered

### Alternativa 1: Keep Native confirm()/alert()

**Pros:**
- Zero development effort.
- Works in all browsers.
- Developers already familiar with the API.

**Cons:**
- Cannot be styled or themed.
- Blocks JavaScript thread.
- No loading state for async operations.
- Inconsistent appearance across browsers/OS.
- Poor accessibility.
- Cannot distinguish between action severity levels.

**Decision:** Rejected. The UX and accessibility costs outweigh the convenience.

### Alternativa 2: Per-Portal Custom Dialogs

Each portal implements its own confirmation dialog with portal-specific styling.

**Pros:**
- Maximum portal-specific customization.
- No cross-portal dependency.

**Cons:**
- Duplicates implementation 4 times.
- Inconsistent behavior (different keyboard handling, different animations, different loading patterns).
- Maintenance burden multiplied by 4.
- Contradicts ADR-048 (Component Sharing Strategy).

**Decision:** Rejected. Violates the sharing strategy and multiplies maintenance cost.

### Alternativa 3: Shared ConfirmDialog + react-hot-toast (Chosen)

**Pros:**
- Single implementation for confirmations, already built and tested.
- 4 variants cover all severity levels.
- Loading state prevents double-clicks on async operations.
- Modal integration provides focus trapping and keyboard navigation.
- react-hot-toast handles non-blocking notifications (success/error/info).
- Consistent with the detective/maya design system.

**Cons:**
- Slightly more code than `window.confirm()` (state variable + component JSX).
- Requires import in every file that uses confirmation.
- Migration of existing 20+ `confirm()` calls is incremental (temporary inconsistency).

**Decision:** CHOSEN for consistent UX, accessibility, and design system alignment.

---

## Consequences

### Positivas

1. **Consistent UX across all portals:** Every confirmation dialog uses the same themed component with the same interaction patterns (keyboard navigation, escape to close, overlay click behavior).
2. **Severity communication:** The 4 variants (danger/warning/info/success) visually communicate the gravity of the action to the user, reducing accidental destructive operations.
3. **Loading state prevents errors:** The `loading` prop disables buttons and blocks dismissal while an async operation completes, preventing double-clicks and premature navigation.
4. **Accessibility compliance:** The Modal-backed ConfirmDialog provides focus trapping, escape-to-close, and proper ARIA attributes — meeting WCAG 2.1 AA requirements for dialogs.
5. **Non-blocking UI:** Unlike native `confirm()`, the ConfirmDialog does not block the JavaScript event loop. WebSocket messages, animations, and background tasks continue while the dialog is open.
6. **Design system coherence:** Confirmation dialogs match the detective/maya theme used throughout the application, eliminating the jarring transition to unstyled browser dialogs.
7. **Toast notifications for non-critical alerts:** `react-hot-toast` provides auto-dismissing, stackable, non-blocking notifications for success/error feedback, replacing thread-blocking `alert()` calls.

### Negativas

1. **More code per confirmation:** Using `ConfirmDialog` requires a state variable (`useState`), the component JSX, and event handlers — roughly 15 lines vs 1 line for `window.confirm()`. This is a minor cost for the benefits gained.
2. **Incremental migration period:** The existing 20+ `window.confirm()` calls will coexist with `ConfirmDialog` until they are individually migrated. During this period, the UX remains inconsistent in unmigrated components.
3. **Import discipline:** Developers must import from `shared/components/common/ConfirmDialog` (not `feedback/`). The deletion of the duplicate helps, but code review should verify correct imports.

---

## Dependencies

| Dependencia | Tipo | Estado | Descripcion |
|-------------|------|--------|-------------|
| ADR-048 | Relacionado | Accepted | Component Sharing Strategy — ConfirmDialog is a concrete example of shared `common/` component |
| Modal | Pre-requisito | Completado | `shared/components/common/Modal.tsx` provides focus trapping, overlay, and escape handling |
| react-hot-toast | Dependencia | Activo | Toast notification library for non-blocking alerts |
| Lucide React | Dependencia | Activo | Icons for variant indicators (XCircle, AlertTriangle, Info, CheckCircle) |

---

## References

- `apps/frontend/src/shared/components/common/ConfirmDialog.tsx` -- Canonical ConfirmDialog implementation (4 variants, loading state, Modal-backed)
- `apps/frontend/src/shared/components/common/Modal.tsx` -- Underlying Modal component with focus trapping and keyboard handling
- ~~`apps/frontend/src/shared/components/feedback/ConfirmDialog.tsx`~~ -- **Deleted** duplicate
- [ADR-048: Component Sharing Strategy](./ADR-048-component-sharing-strategy.md)
- [react-hot-toast Documentation](https://react-hot-toast.com/)
- [WCAG 2.1 — Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- CLAUDE.md -- 575 production .tsx components, 4 portals, detective/maya design system

---

**Estado:** Aceptada
**Date Created:** 2026-02-21
**Last Updated:** 2026-02-21
**Supersedes:** N/A
**Superseded by:** N/A
