# US-ACT-008: Navegación entre actividades

**Épica:** EAI-002 - Actividades Básicas Hardcodeadas
**Sprint:** Mes 1, Semana 4
**Story Points:** 4 SP
**Presupuesto:** $1,500 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **navegar fluidamente entre actividades de un módulo** para **completar mi aprendizaje de forma ordenada y seguir mi progreso**.

**Contexto del Alcance Inicial:**
Sistema de navegación lineal entre actividades. Los estudiantes avanzan secuencialmente, ven su progreso, y pueden marcar módulos como completados. Sin navegación libre (debes completar actividad actual para avanzar).

---

## Criterios de Aceptación

- [ ] **CA-01:** Barra de progreso muestra actividades completadas / total
- [ ] **CA-02:** Botón "Siguiente" lleva a siguiente actividad
- [ ] **CA-03:** Botón "Anterior" lleva a actividad previa (si existe)
- [ ] **CA-04:** No se puede avanzar sin completar actividad actual
- [ ] **CA-05:** Al completar última actividad, se marca módulo como completado
- [ ] **CA-06:** Se muestra mensaje de felicitación al completar módulo
- [ ] **CA-07:** Botón "Salir" regresa al dashboard
- [ ] **CA-08:** Indicador visual de actividad actual
- [ ] **CA-09:** Tooltips muestran título de cada actividad

---

## Especificaciones Técnicas

### Backend

**Endpoints:**
```
GET /api/modules/:moduleId/activities
- Response: {
    data: [
      {
        id, title, type, order,
        isCompleted: boolean,
        isCurrent: boolean
      }
    ],
    meta: {
      totalActivities: number,
      completedActivities: number,
      progressPercentage: number
    }
  }

POST /api/modules/:moduleId/complete
- Marca módulo como completado
- Otorga recompensas de módulo
- Response: { moduleCompleted: true, rewards: { xp, coins, badge } }

GET /api/activities/:id/next
- Response: { nextActivity: { id, title } | null }

GET /api/activities/:id/previous
- Response: { previousActivity: { id, title } | null }
```

**Lógica de Progreso:**
```typescript
class ModulesService {
  async getModuleProgress(moduleId: string, userId: string) {
    const activities = await this.activitiesRepository.find({
      where: { moduleId },
      order: { order: 'ASC' }
    })

    const completedAttempts = await this.attemptsRepository.find({
      where: {
        userId,
        activityId: In(activities.map(a => a.id)),
        isCorrect: true
      }
    })

    const completedActivityIds = new Set(completedAttempts.map(a => a.activityId))

    return {
      totalActivities: activities.length,
      completedActivities: completedActivityIds.size,
      progressPercentage: (completedActivityIds.size / activities.length) * 100,
      activities: activities.map(activity => ({
        ...activity,
        isCompleted: completedActivityIds.has(activity.id)
      }))
    }
  }

  async completeModule(moduleId: string, userId: string) {
    // Verificar que todas las actividades estén completadas
    const progress = await this.getModuleProgress(moduleId, userId)
    if (progress.progressPercentage < 100) {
      throw new BadRequestException('Module not fully completed')
    }

    // Registrar módulo completado
    await this.moduleProgressRepository.save({
      userId,
      moduleId,
      completedAt: new Date()
    })

    // Otorgar recompensas
    const module = await this.modulesRepository.findOne({ where: { id: moduleId } })
    await this.gamificationService.awardXP(userId, module.xpReward)
    await this.gamificationService.awardCoins(userId, module.coinsReward)

    // Otorgar insignia si existe
    if (module.badgeId) {
      await this.gamificationService.awardBadge(userId, module.badgeId)
    }

    return {
      moduleCompleted: true,
      rewards: {
        xp: module.xpReward,
        coins: module.coinsReward,
        badge: module.badgeId
      }
    }
  }
}
```

### Frontend

**Componente de Navegación:**
```typescript
// pages/ModuleActivityPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export function ModuleActivityPage() {
  const { moduleId, activityId } = useParams()
  const navigate = useNavigate()

  const [activity, setActivity] = useState(null)
  const [progress, setProgress] = useState(null)
  const [nextActivity, setNextActivity] = useState(null)
  const [previousActivity, setPreviousActivity] = useState(null)

  useEffect(() => {
    loadActivity()
    loadProgress()
    loadNavigation()
  }, [activityId])

  const handleActivityComplete = async () => {
    // Recargar progreso
    await loadProgress()

    // Si hay siguiente, navegar
    if (nextActivity) {
      navigate(`/modules/${moduleId}/activities/${nextActivity.id}`)
    } else {
      // Última actividad, completar módulo
      await completeModule()
    }
  }

  const completeModule = async () => {
    const result = await modulesService.completeModule(moduleId)
    // Mostrar modal de felicitación
    setShowCompletionModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <ProgressBar progress={progress} />

      {/* Activity Content */}
      <div className="container mx-auto px-4 py-8">
        {activity && (
          <ActivityRenderer
            activity={activity}
            onComplete={handleActivityComplete}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={previousActivity ? () => navigate(`/modules/${moduleId}/activities/${previousActivity.id}`) : null}
        onNext={nextActivity ? () => navigate(`/modules/${moduleId}/activities/${nextActivity.id}`) : null}
        onExit={() => navigate('/dashboard')}
      />

      {/* Completion Modal */}
      {showCompletionModal && (
        <ModuleCompletionModal
          module={module}
          rewards={completionRewards}
          onClose={() => navigate('/dashboard')}
        />
      )}
    </div>
  )
}
```

**Progress Bar:**
```typescript
// components/modules/ProgressBar.tsx
export function ProgressBar({ progress }) {
  if (!progress) return null

  const percentage = progress.progressPercentage

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-700">Progreso del módulo</h3>
          <span className="text-sm text-gray-600">
            {progress.completedActivities} / {progress.totalActivities} actividades
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-maya-green-500 to-maya-green-600 h-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Círculos de actividades */}
        <div className="flex justify-between mt-3">
          {progress.activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex flex-col items-center"
              title={activity.title}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                activity.isCompleted
                  ? 'bg-green-500 text-white'
                  : activity.id === activityId
                  ? 'bg-maya-green-500 text-white ring-4 ring-maya-green-200'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {activity.isCompleted ? '✓' : index + 1}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center max-w-[60px] truncate">
                {activity.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Navigation Buttons:**
```typescript
// components/modules/NavigationButtons.tsx
export function NavigationButtons({ onPrevious, onNext, onExit }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto flex justify-between">
        <Button
          onClick={onExit}
          variant="ghost"
        >
          Salir
        </Button>

        <div className="flex gap-3">
          {onPrevious && (
            <Button onClick={onPrevious} variant="outline">
              ← Anterior
            </Button>
          )}

          {onNext && (
            <Button onClick={onNext} variant="primary">
              Siguiente →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Module Completion Modal:**
```typescript
// components/modules/ModuleCompletionModal.tsx
export function ModuleCompletionModal({ module, rewards, onClose }) {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.4 }
    })
  }, [])

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <div className="text-center py-6">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Módulo Completado!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Has completado exitosamente el módulo "{module.title}"
        </p>

        {/* Recompensas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-sm text-gray-600">XP Ganado</p>
            <p className="text-2xl font-bold text-yellow-700">+{rewards.xp}</p>
          </div>

          <div className="bg-gold-50 p-4 rounded-lg">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600">ML Coins</p>
            <p className="text-2xl font-bold text-gold-700">+{rewards.coins}</p>
          </div>

          {rewards.badge && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm text-gray-600">Insignia</p>
              <p className="text-sm font-bold text-purple-700">Desbloqueada</p>
            </div>
          )}
        </div>

        <Button onClick={onClose} variant="primary" fullWidth>
          Volver al Dashboard
        </Button>
      </div>
    </Modal>
  )
}
```

---

## Dependencias

**Antes:**
- US-ACT-001 a US-ACT-006 (Mecánicas)
- US-FUND-003 (Dashboard)
- US-GAM-002, US-GAM-003, US-GAM-005 (Recompensas)

---

## Definición de Hecho (DoD)

- [x] Progress bar funcional
- [x] Navegación secuencial
- [x] Botones anterior/siguiente
- [x] Completar módulo otorga recompensas
- [x] Modal de felicitación
- [x] No se puede saltar actividades
- [x] Tests E2E de navegación

---

## Notas del Alcance Inicial

- ✅ Navegación lineal (secuencial)
- ✅ Sin navegación libre (skip)
- ✅ Sin re-intentar actividades completadas
- ⚠️ **Extensión futura:** EXT-022-Flexibility (navegación libre, re-intentos)

---

## Estimación

**Desglose (4 SP = ~1.5 días):**
- Backend: progreso: 0.5 días
- Frontend: navegación: 0.75 días
- Modal completar: 0.25 días

---

**Creado:** 2025-11-02
**Responsable:** Equipo Fullstack
