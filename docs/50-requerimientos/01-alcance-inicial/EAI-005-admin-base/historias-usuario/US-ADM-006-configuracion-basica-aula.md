---
id: "US-ADM-006"
title: "Configuración Básica de Aula"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-005"
story_points: 6
budget: "$2,400 MXN"
sprint: "Sprint-1"
labels: ["admin", "settings", "classroom-configuration"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-ADM-006: Configuración Básica de Aula

**Épica:** EAI-005 (Plataforma de Maestro Básica)
**Sprint:** Mes 1, Semana 3
**Story Points:** 6 SP
**Presupuesto:** $2,400 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como profesor, quiero configurar aspectos básicos de mi aula como fechas de inicio/fin, visibilidad de módulos y gamificación para controlar la experiencia de mis estudiantes.

**Contexto del Alcance Inicial:**

Esta funcionalidad proporciona configuraciones básicas del aula con valores simples (on/off, fechas). NO incluye configuración avanzada por módulo, parametrización de gamificación, reglas personalizadas, ni configuración de notificaciones (eso va a EXT-001 Portal de Maestros Completo).

---

## Criterios de Aceptación

### CA-01: Configuración de Fechas
- [ ] Campo: Fecha de inicio del aula (opcional)
- [ ] Campo: Fecha de fin del aula (opcional)
- [ ] Validación: fecha fin > fecha inicio
- [ ] Efecto: si está fuera del rango de fechas, mostrar mensaje a estudiantes

### CA-02: Visibilidad de Módulos
- [ ] Toggle global: "Módulos visibles para estudiantes"
- [ ] Opciones:
  - **Todos visibles:** estudiantes ven todos los módulos asignados
  - **Ocultos:** estudiantes no ven módulos (profesor puede habilitar individualmente)
- [ ] Default: Todos visibles

### CA-03: Configuración de Gamificación
- [ ] Toggle: "Gamificación activa"
- [ ] Opciones:
  - **Activa:** estudiantes ganan XP, suben niveles, desbloquean logros
  - **Inactiva:** sin XP, niveles, ni logros (solo progreso %)
- [ ] Default: Activa

### CA-04: Vista de Configuración
- [ ] Formulario claro con secciones:
  - Información General (fechas)
  - Configuración de Contenido (visibilidad)
  - Configuración de Gamificación
- [ ] Botón "Guardar Cambios"
- [ ] Confirmación al guardar

### CA-05: Valores Fijos (No Configurables en Alcance Inicial)
- [ ] XP por actividad: valores hardcodeados
- [ ] Niveles: sistema predefinido
- [ ] Logros: catálogo predefinido
- [ ] Nota: configuración avanzada va a EXT-001

---

## Especificaciones Técnicas

### Backend

**Endpoint:**

```typescript
// Obtener configuración del aula
GET /api/teacher/classrooms/{classroomId}/settings

// Actualizar configuración del aula
PATCH /api/teacher/classrooms/{classroomId}/settings
Body: {
  startDate?: string;
  endDate?: string;
  modulesVisible?: boolean;
  gamificationEnabled?: boolean;
}
```

**Response:**
```json
{
  "classroomId": "uuid",
  "settings": {
    "startDate": "2025-09-01",
    "endDate": "2026-06-30",
    "modulesVisible": true,
    "gamificationEnabled": true
  },
  "updatedAt": "2025-11-02T10:00:00Z"
}
```

**Controller:**
```typescript
@Controller('teacher/classrooms/:classroomId')
export class ClassroomSettingsController {
  @Get('settings')
  async getSettings(
    @Param('classroomId') classroomId: string,
    @CurrentUser() teacher: User
  ) {
    return this.classroomService.getSettings(classroomId, teacher.id);
  }

  @Patch('settings')
  async updateSettings(
    @Param('classroomId') classroomId: string,
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() teacher: User
  ) {
    return this.classroomService.updateSettings(
      classroomId,
      dto,
      teacher.id
    );
  }
}
```

**DTO:**
```typescript
export class UpdateSettingsDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  modulesVisible?: boolean;

  @IsBoolean()
  @IsOptional()
  gamificationEnabled?: boolean;
}
```

**Service:**
```typescript
async updateSettings(
  classroomId: string,
  dto: UpdateSettingsDto,
  teacherId: string
) {
  await this.validateTeacherAccess(classroomId, teacherId);

  const classroom = await this.classroomRepository.findOne({
    where: { id: classroomId },
    relations: ['settings']
  });

  // Validar fechas
  if (dto.startDate && dto.endDate) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end <= start) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio'
      );
    }
  }

  // Actualizar o crear settings
  if (!classroom.settings) {
    classroom.settings = this.settingsRepository.create({
      classroomId: classroom.id,
      ...dto
    });
  } else {
    Object.assign(classroom.settings, dto);
  }

  await this.settingsRepository.save(classroom.settings);

  return {
    classroomId,
    settings: {
      startDate: classroom.settings.startDate,
      endDate: classroom.settings.endDate,
      modulesVisible: classroom.settings.modulesVisible,
      gamificationEnabled: classroom.settings.gamificationEnabled
    },
    updatedAt: classroom.settings.updatedAt
  };
}
```

**Modelo:**
```typescript
@Entity('classroom_settings')
export class ClassroomSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'classroom_id', unique: true })
  classroomId: string;

  @OneToOne(() => Classroom)
  @JoinColumn({ name: 'classroom_id' })
  classroom: Classroom;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: string;

  @Column({ default: true, name: 'modules_visible' })
  modulesVisible: boolean;

  @Column({ default: true, name: 'gamification_enabled' })
  gamificationEnabled: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Actualizar Classroom entity
@Entity('classrooms')
export class Classroom {
  // ... campos existentes ...

  @OneToOne(() => ClassroomSettings, settings => settings.classroom, {
    cascade: true,
    eager: true
  })
  settings: ClassroomSettings;
}
```

### Frontend

**Ruta:**
```
/teacher/classroom/:classroomId/settings
```

**Vista de Configuración:**
```typescript
// ClassroomSettingsView.tsx
export const ClassroomSettingsView = () => {
  const { classroomId } = useParams();
  const { settings, isLoading } = useClassroomSettings(classroomId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty }
  } = useForm({
    defaultValues: settings
  });

  const onSubmit = async (data) => {
    try {
      await updateClassroomSettings(classroomId, data);
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="classroom-settings-container">
      <PageHeader
        title="Configuración del Aula"
        breadcrumb={[
          { label: 'Dashboard', to: '/teacher/dashboard' },
          { label: 'Configuración' }
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <SettingsSection title="Información General">
          <FormField
            label="Fecha de Inicio"
            description="Fecha en que el aula estará disponible para estudiantes"
            error={errors.startDate?.message}
          >
            <Input
              type="date"
              {...register('startDate')}
            />
          </FormField>

          <FormField
            label="Fecha de Fin"
            description="Fecha en que el aula dejará de estar disponible"
            error={errors.endDate?.message}
          >
            <Input
              type="date"
              {...register('endDate')}
            />
          </FormField>

          {watch('startDate') && watch('endDate') && (
            <InfoBox>
              Duración del aula: {calculateDuration(watch('startDate'), watch('endDate'))} días
            </InfoBox>
          )}
        </SettingsSection>

        <SettingsSection title="Configuración de Contenido">
          <FormField
            label="Visibilidad de Módulos"
            description="Controla si los estudiantes pueden ver los módulos asignados"
          >
            <Toggle
              {...register('modulesVisible')}
              label={watch('modulesVisible') ? 'Módulos visibles' : 'Módulos ocultos'}
            />
          </FormField>

          {!watch('modulesVisible') && (
            <Alert severity="warning">
              Los módulos están ocultos. Los estudiantes no podrán acceder a ningún contenido.
            </Alert>
          )}
        </SettingsSection>

        <SettingsSection title="Configuración de Gamificación">
          <FormField
            label="Gamificación"
            description="Activa o desactiva el sistema de XP, niveles y logros"
          >
            <Toggle
              {...register('gamificationEnabled')}
              label={watch('gamificationEnabled') ? 'Gamificación activa' : 'Gamificación desactivada'}
            />
          </FormField>

          {!watch('gamificationEnabled') && (
            <Alert severity="info">
              Con gamificación desactivada, los estudiantes solo verán su progreso en porcentaje.
            </Alert>
          )}

          <InfoBox type="note">
            <strong>Nota:</strong> La configuración avanzada de XP, niveles y logros estará
            disponible en una extensión futura.
          </InfoBox>
        </SettingsSection>

        <FormActions sticky>
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            leftIcon={<SaveIcon />}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          {isDirty && (
            <span className="text-sm text-gray-500">
              Tienes cambios sin guardar
            </span>
          )}
        </FormActions>
      </form>
    </div>
  );
};
```

**Componente de Sección:**
```typescript
// SettingsSection.tsx
export const SettingsSection = ({ title, children }) => {
  return (
    <section className="settings-section">
      <h2 className="section-title">{title}</h2>
      <div className="section-content">
        {children}
      </div>
    </section>
  );
};
```

**Componente Toggle:**
```typescript
// Toggle.tsx
export const Toggle = ({ label, ...props }) => {
  return (
    <label className="toggle-container">
      <input type="checkbox" className="toggle-input" {...props} />
      <span className="toggle-slider"></span>
      <span className="toggle-label">{label}</span>
    </label>
  );
};
```

---

## Diseño UI/UX

### Layout
```
+-------------------------------------------------------------------+
|  Configuración del Aula                                          |
+-------------------------------------------------------------------+
|  INFORMACIÓN GENERAL                                             |
|  Fecha de Inicio:  [  01/09/2025  ]                             |
|  Fecha de Fin:     [  30/06/2026  ]                             |
|  ℹ️ Duración del aula: 273 días                                  |
+-------------------------------------------------------------------+
|  CONFIGURACIÓN DE CONTENIDO                                      |
|  Visibilidad de Módulos                                          |
|  [●━━━━━━━━━] Módulos visibles                                   |
|  Los estudiantes pueden ver los módulos asignados               |
+-------------------------------------------------------------------+
|  CONFIGURACIÓN DE GAMIFICACIÓN                                   |
|  Gamificación                                                    |
|  [●━━━━━━━━━] Gamificación activa                                |
|  Los estudiantes ganan XP, suben niveles y desbloquean logros   |
|                                                                   |
|  📝 Nota: La configuración avanzada de XP, niveles y logros      |
|  estará disponible en una extensión futura.                     |
+-------------------------------------------------------------------+
|                                            [💾 Guardar Cambios]  |
+-------------------------------------------------------------------+
```

---

## Alcance Básico vs Extensiones

### EAI-005 (Este alcance - Admin Base):
- Fechas de inicio/fin del aula
- Toggle de visibilidad de módulos (global)
- Toggle de gamificación (on/off)
- Valores de XP/niveles/logros hardcodeados

### EXT-001 (Extensión futura - Portal Maestros Completo):
- Configuración de visibilidad por módulo individual
- Programación de fechas de disponibilidad por módulo
- Configuración de XP personalizado por actividad
- Sistema de niveles personalizado
- Logros custom
- Configuración de notificaciones
- Reglas de acceso condicional (desbloquear módulo X al completar Y)
- Tiempo límite por actividad/módulo

---

## Dependencias

### Dependencias de User Stories:
- US-ADM-001 (aulas)
- EAI-003 (sistema de gamificación debe respetar el toggle)

---

## Pruebas

### Pruebas Unitarias:
- [ ] Validación de fecha fin > fecha inicio
- [ ] Settings se crean si no existen
- [ ] Settings se actualizan si existen

### Pruebas de Integración:
- [ ] Toggle de gamificación afecta a experiencia del estudiante
- [ ] Toggle de módulos oculta/muestra módulos correctamente
- [ ] Fechas limitan acceso al aula

### Pruebas E2E:
- [ ] Profesor actualiza configuración
- [ ] Cambios se reflejan en experiencia del estudiante
- [ ] Validación de fechas funciona

---

## Notas de Implementación

1. **Impacto en Estudiantes:**
   - Si `modulesVisible = false`: estudiantes ven mensaje "Contenido no disponible"
   - Si `gamificationEnabled = false`: ocultar XP, niveles, logros en UI
   - Si fuera de rango de fechas: mensaje "Aula no disponible"

2. **Defaults:**
   - modulesVisible: true
   - gamificationEnabled: true
   - Fechas: null (sin restricción)

3. **UX:**
   - Mostrar preview de cómo verán los estudiantes
   - Confirmación al desactivar gamificación (puede afectar motivación)

---

## Estimación de Esfuerzo

**Backend:** 2 SP
**Frontend:** 3 SP
**Testing:** 1 SP

**Total:** 6 SP = $2,400 MXN
