# Catálogo de Componentes UI

**Código que mapea:** `apps/frontend/src/shared/components/`
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Catálogo completo de los 180+ componentes UI compartidos.

---

## 🎨 Componentes por Categoría

### UI Base (~40 componentes)

- Avatar
- Button
- Card
- Checkbox
- Divider
- Dropdown
- FileUpload
- Header
- Footer
- Icon
- Input
- Label
- Link
- LoadingSpinner
- Modal
- ProgressBar
- Radio
- Sidebar
- Switch
- Table
- Tabs
- Tag
- Textarea
- Toast
- Tooltip

... (lista completa de 40)

### Gamification (~25 componentes)

- AchievementCard
- AchievementFilter
- AchievementModal
- AchievementsGrid
- BadgeDisplay
- CoinAnimation
- LeaderboardTable
- LeaderboardTabs
- MLCoinsDisplay
- PowerupCard
- RankBadge
- RankProgressBar
- RewardNotification

... (lista completa de 25)

### Educational (~30 componentes)

- ExerciseAttemptCard
- ExerciseCard
- ExerciseFilter
- ExerciseList
- ExerciseViewer
- FeedbackPanel
- HintButton
- InstructionsPanel
- ModuleCard
- QuizCard
- QuizViewer
- SubmitButton

... (lista completa de 30)

---

## 📚 Uso de Componentes

### Importación

```typescript
import { Button, Card, Modal } from '@/shared/components';
```

### Ejemplo de uso

```typescript
<Card title="Mi Card">
  <Button variant="primary" onClick={handleClick}>
    Clic aquí
  </Button>
</Card>
```

---

## 🎯 Storybook

**Ver componentes en Storybook:**

```bash
cd apps/frontend
npm run storybook
```

**URL:** http://localhost:6006

---

**Última actualización:** 2025-11-07
