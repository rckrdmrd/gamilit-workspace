-- =====================================================
-- Seeds: notification_templates
-- Schema: notifications
-- Descripción: Plantillas predefinidas para sistema de notificaciones multi-canal
-- Relacionado: EXT-003 (Notificaciones Multi-Canal)
-- Fecha: 2025-11-13
-- =====================================================
--
-- IMPORTANTE:
-- - Plantillas usan sintaxis {{variable_name}} para interpolación
-- - Variables disponibles en JSONB para validación
-- - default_channels define canales por defecto (in_app, email, push)
--
-- =====================================================

-- Template 1: Bienvenida al sistema
INSERT INTO notifications.notification_templates (
    template_key,
    name,
    description,
    subject_template,
    body_template,
    html_template,
    variables,
    default_channels,
    is_active
) VALUES (
    'welcome_email',
    'Bienvenida al Sistema',
    'Email de bienvenida para nuevos usuarios',
    '¡Bienvenido a Gamilit, {{user_name}}!',
    'Hola {{user_name}},

¡Bienvenido a Gamilit! Estamos emocionados de tenerte con nosotros.

Tu cuenta ha sido creada exitosamente con el correo: {{user_email}}

Empieza tu aventura de aprendizaje explorando nuestros módulos educativos y desbloquea logros mientras aprendes.

¡Buena suerte!

Equipo Gamilit',
    '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4A90E2;">¡Bienvenido a Gamilit, {{user_name}}!</h2>
    <p>Estamos emocionados de tenerte con nosotros.</p>
    <p>Tu cuenta ha sido creada exitosamente con el correo: <strong>{{user_email}}</strong></p>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>¿Qué puedes hacer ahora?</h3>
        <ul>
            <li>Explorar módulos educativos</li>
            <li>Completar ejercicios interactivos</li>
            <li>Desbloquear logros y ganar ML Coins</li>
            <li>Competir en las tablas de clasificación</li>
        </ul>
    </div>
    <p>¡Buena suerte en tu aventura de aprendizaje!</p>
    <p style="color: #666; font-size: 12px;">Equipo Gamilit</p>
</body>
</html>',
    '["user_name", "user_email"]'::jsonb,
    ARRAY['email'],
    true
)
ON CONFLICT (template_key, version) DO NOTHING;

-- Template 2: Nueva asignación
INSERT INTO notifications.notification_templates (
    template_key,
    name,
    description,
    subject_template,
    body_template,
    html_template,
    variables,
    default_channels,
    is_active
) VALUES (
    'new_assignment',
    'Nueva Asignación',
    'Notificación cuando se asigna nueva tarea al estudiante',
    'Nueva asignación: {{assignment_title}}',
    'Hola {{student_name}},

Tu profesor {{teacher_name}} te ha asignado una nueva tarea:

📚 {{assignment_title}}
📅 Fecha de entrega: {{due_date}}
📝 Módulo: {{module_name}}

Descripción:
{{assignment_description}}

¡No olvides completarla antes de la fecha límite!

Accede a la plataforma para ver más detalles.',
    '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #E74C3C;">Nueva Asignación</h2>
    <p>Hola <strong>{{student_name}}</strong>,</p>
    <p>Tu profesor <strong>{{teacher_name}}</strong> te ha asignado una nueva tarea:</p>
    <div style="background-color: #fff3cd; border-left: 4px solid #f0ad4e; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0;">📚 {{assignment_title}}</h3>
        <p><strong>📅 Fecha de entrega:</strong> {{due_date}}</p>
        <p><strong>📝 Módulo:</strong> {{module_name}}</p>
        <p><strong>Descripción:</strong><br>{{assignment_description}}</p>
    </div>
    <p style="color: #e74c3c; font-weight: bold;">¡No olvides completarla antes de la fecha límite!</p>
    <a href="{{assignment_url}}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Ver Asignación</a>
</body>
</html>',
    '["student_name", "teacher_name", "assignment_title", "assignment_description", "due_date", "module_name", "assignment_url"]'::jsonb,
    ARRAY['email', 'push', 'in_app'],
    true
)
ON CONFLICT (template_key, version) DO NOTHING;

-- Template 3: Recordatorio de tarea próxima a vencer
INSERT INTO notifications.notification_templates (
    template_key,
    name,
    description,
    subject_template,
    body_template,
    html_template,
    variables,
    default_channels,
    is_active
) VALUES (
    'assignment_reminder',
    'Recordatorio de Tarea',
    'Recordatorio cuando una asignación está por vencer',
    'Recordatorio: {{assignment_title}} vence en {{hours_remaining}} horas',
    'Hola {{student_name}},

⏰ Recordatorio: Tu tarea está por vencer

📚 {{assignment_title}}
⏱️ Tiempo restante: {{hours_remaining}} horas
📅 Fecha límite: {{due_date}}

{{completion_status}}

¡Accede a la plataforma para completarla!',
    '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #fff3cd; border: 2px solid #f0ad4e; padding: 20px; border-radius: 8px;">
        <h2 style="color: #856404; margin-top: 0;">⏰ Recordatorio de Tarea</h2>
        <p>Hola <strong>{{student_name}}</strong>,</p>
        <p>Tu tarea está por vencer:</p>
        <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #333;">📚 {{assignment_title}}</h3>
            <p><strong>⏱️ Tiempo restante:</strong> <span style="color: #e74c3c; font-size: 18px;">{{hours_remaining}} horas</span></p>
            <p><strong>📅 Fecha límite:</strong> {{due_date}}</p>
            <p><strong>Estado:</strong> {{completion_status}}</p>
        </div>
        <a href="{{assignment_url}}" style="background-color: #f0ad4e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Completar Ahora</a>
    </div>
</body>
</html>',
    '["student_name", "assignment_title", "hours_remaining", "due_date", "completion_status", "assignment_url"]'::jsonb,
    ARRAY['email', 'push'],
    true
)
ON CONFLICT (template_key, version) DO NOTHING;

-- Template 4: Logro desbloqueado
INSERT INTO notifications.notification_templates (
    template_key,
    name,
    description,
    subject_template,
    body_template,
    html_template,
    variables,
    default_channels,
    is_active
) VALUES (
    'achievement_unlocked',
    'Logro Desbloqueado',
    'Notificación cuando el estudiante desbloquea un logro',
    '🏆 ¡Logro desbloqueado: {{achievement_name}}!',
    '¡Felicidades {{student_name}}!

🏆 Has desbloqueado un nuevo logro:

{{achievement_name}}
{{achievement_description}}

💎 Recompensa: {{ml_coins_earned}} ML Coins

¡Sigue así y desbloquea más logros!',
    '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 8px; text-align: center;">
        <h2 style="color: #155724; margin-top: 0;">🏆 ¡Logro Desbloqueado!</h2>
        <p style="font-size: 18px;">¡Felicidades <strong>{{student_name}}</strong>!</p>
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="font-size: 48px; margin-bottom: 10px;">{{achievement_icon}}</div>
            <h3 style="color: #333; margin: 10px 0;">{{achievement_name}}</h3>
            <p style="color: #666;">{{achievement_description}}</p>
            <div style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 15px;">
                <strong style="color: #856404;">💎 Recompensa: {{ml_coins_earned}} ML Coins</strong>
            </div>
        </div>
        <p style="color: #28a745; font-weight: bold;">¡Sigue así y desbloquea más logros!</p>
    </div>
</body>
</html>',
    '["student_name", "achievement_name", "achievement_description", "achievement_icon", "ml_coins_earned"]'::jsonb,
    ARRAY['in_app', 'push'],
    true
)
ON CONFLICT (template_key, version) DO NOTHING;

-- Template 5: Mensaje del profesor
INSERT INTO notifications.notification_templates (
    template_key,
    name,
    description,
    subject_template,
    body_template,
    html_template,
    variables,
    default_channels,
    is_active
) VALUES (
    'teacher_message',
    'Mensaje del Profesor',
    'Mensaje directo del profesor al estudiante',
    'Mensaje de {{teacher_name}}',
    'Hola {{student_name}},

Tu profesor {{teacher_name}} te ha enviado un mensaje:

"{{message_content}}"

{{classroom_name}}

Responde a través de la plataforma.',
    '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4A90E2;">Mensaje de tu Profesor</h2>
    <p>Hola <strong>{{student_name}}</strong>,</p>
    <p>Tu profesor <strong>{{teacher_name}}</strong> te ha enviado un mensaje:</p>
    <div style="background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
        <p style="font-style: italic; color: #333; margin: 0;">"{{message_content}}"</p>
    </div>
    <p style="color: #666; font-size: 14px;">Aula: {{classroom_name}}</p>
    <a href="{{message_url}}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Responder</a>
</body>
</html>',
    '["student_name", "teacher_name", "message_content", "classroom_name", "message_url"]'::jsonb,
    ARRAY['email', 'in_app'],
    true
)
ON CONFLICT (template_key, version) DO NOTHING;

-- Template 6: Invitacion a grupo/equipo
INSERT INTO notifications.notification_templates (
    template_key,
    name,
    description,
    subject_template,
    body_template,
    html_template,
    variables,
    default_channels,
    is_active
) VALUES (
    'team_invitation',
    'Invitación a Equipo',
    'Invitación para unirse a un equipo o grupo de estudio',
    'Te invitaron a unirte a {{team_name}}',
    'Hola {{student_name}},

{{inviter_name}} te ha invitado a unirte al equipo:

👥 {{team_name}}
📚 {{team_description}}

Miembros actuales: {{member_count}}

¿Quieres unirte?',
    '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #9C27B0;">Invitación a Equipo</h2>
    <p>Hola <strong>{{student_name}}</strong>,</p>
    <p><strong>{{inviter_name}}</strong> te ha invitado a unirte a un equipo:</p>
    <div style="background-color: #f3e5f5; border: 2px solid #9C27B0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #6A1B9A; margin-top: 0;">👥 {{team_name}}</h3>
        <p style="color: #333;">{{team_description}}</p>
        <p style="color: #666; font-size: 14px;">Miembros actuales: <strong>{{member_count}}</strong></p>
    </div>
    <div style="text-align: center; margin: 20px 0;">
        <a href="{{accept_url}}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 0 5px;">✓ Aceptar</a>
        <a href="{{decline_url}}" style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 0 5px;">✗ Rechazar</a>
    </div>
</body>
</html>',
    '["student_name", "inviter_name", "team_name", "team_description", "member_count", "accept_url", "decline_url"]'::jsonb,
    ARRAY['in_app', 'push'],
    true
)
ON CONFLICT (template_key, version) DO NOTHING;

-- Template 7: Retroalimentacion de ejercicio
INSERT INTO notifications.notification_templates (
    template_key,
    name,
    description,
    subject_template,
    body_template,
    html_template,
    variables,
    default_channels,
    is_active
) VALUES (
    'exercise_feedback',
    'Retroalimentación de Ejercicio',
    'Notificación cuando el profesor califica y deja retroalimentación',
    'Retroalimentación recibida: {{exercise_title}}',
    'Hola {{student_name}},

Tu profesor {{teacher_name}} ha calificado tu ejercicio:

📝 {{exercise_title}}
⭐ Calificación: {{score}}/100
{{grade_emoji}}

Retroalimentación:
{{feedback_text}}

XP ganados: {{xp_earned}}
ML Coins: {{ml_coins_earned}}',
    '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4A90E2;">Retroalimentación de Ejercicio</h2>
    <p>Hola <strong>{{student_name}}</strong>,</p>
    <p>Tu profesor <strong>{{teacher_name}}</strong> ha calificado tu ejercicio:</p>
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">📝 {{exercise_title}}</h3>
        <div style="font-size: 48px; text-align: center; margin: 20px 0;">{{grade_emoji}}</div>
        <p style="text-align: center; font-size: 24px; color: #4A90E2; margin: 10px 0;">
            <strong>⭐ {{score}}/100</strong>
        </p>
        <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #4A90E2;">
            <p style="margin: 0; color: #333;"><strong>Retroalimentación:</strong></p>
            <p style="margin: 10px 0 0 0; color: #555;">{{feedback_text}}</p>
        </div>
        <div style="display: flex; justify-content: space-around; margin-top: 20px;">
            <div style="text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">XP Ganados</p>
                <p style="margin: 5px 0; font-size: 20px; color: #4CAF50;"><strong>+{{xp_earned}}</strong></p>
            </div>
            <div style="text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">ML Coins</p>
                <p style="margin: 5px 0; font-size: 20px; color: #f0ad4e;"><strong>+{{ml_coins_earned}}</strong></p>
            </div>
        </div>
    </div>
    <a href="{{exercise_url}}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Ver Detalles</a>
</body>
</html>',
    '["student_name", "teacher_name", "exercise_title", "score", "grade_emoji", "feedback_text", "xp_earned", "ml_coins_earned", "exercise_url"]'::jsonb,
    ARRAY['email', 'in_app'],
    true
)
ON CONFLICT (template_key, version) DO NOTHING;

-- Template 8: Racha de dias consecutivos
INSERT INTO notifications.notification_templates (
    template_key,
    name,
    description,
    subject_template,
    body_template,
    html_template,
    variables,
    default_channels,
    is_active
) VALUES (
    'streak_milestone',
    'Racha Alcanzada',
    'Notificación al alcanzar hito de racha de días consecutivos',
    '🔥 ¡{{streak_days}} días de racha!',
    '¡Increíble {{student_name}}!

🔥 Has alcanzado una racha de {{streak_days}} días consecutivos

Sigue así para mantener tu racha y ganar más recompensas.

💎 Bonus de racha: {{bonus_coins}} ML Coins

¡No rompas la racha mañana!',
    '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #fff3e0; border: 2px solid #ff9800; padding: 20px; border-radius: 8px; text-align: center;">
        <div style="font-size: 64px; margin: 20px 0;">🔥</div>
        <h2 style="color: #e65100; margin: 10px 0;">¡Racha de {{streak_days}} Días!</h2>
        <p style="font-size: 18px;">¡Increíble <strong>{{student_name}}</strong>!</p>
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; color: #333;">Has mantenido tu racha de aprendizaje por:</p>
            <p style="font-size: 48px; color: #ff9800; font-weight: bold; margin: 10px 0;">{{streak_days}}</p>
            <p style="font-size: 16px; color: #333;">días consecutivos</p>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin-top: 20px;">
                <p style="margin: 0; color: #856404;"><strong>💎 Bonus de racha:</strong></p>
                <p style="font-size: 24px; color: #f0ad4e; margin: 10px 0; font-weight: bold;">+{{bonus_coins}} ML Coins</p>
            </div>
        </div>
        <p style="color: #e65100; font-weight: bold; font-size: 16px;">¡Sigue así para mantener tu racha!</p>
    </div>
</body>
</html>',
    '["student_name", "streak_days", "bonus_coins"]'::jsonb,
    ARRAY['in_app', 'push'],
    true
)
ON CONFLICT (template_key, version) DO NOTHING;

-- Template 9: Promocion de rango (BD-P04: propagated from staging)
INSERT INTO notifications.notification_templates (
    template_key, name, description, subject_template, body_template, html_template, variables, default_channels, is_active
) VALUES (
    'rank_promoted',
    'Promocion de Rango',
    'Notificacion cuando el estudiante sube de rango',
    '🎖️ ¡Has ascendido a {{new_rank}}!',
    '¡Felicidades {{student_name}}!

🎖️ Has sido promovido de rango:

Rango anterior: {{old_rank}}
Nuevo rango: {{new_rank}}

¡Sigue esforzandote para alcanzar el siguiente nivel!',
    NULL,
    '["student_name", "old_rank", "new_rank", "rank_icon"]'::jsonb,
    ARRAY['in_app', 'push'],
    true
) ON CONFLICT (template_key, version) DO NOTHING;

-- Template 10: Modulo completado
INSERT INTO notifications.notification_templates (
    template_key, name, description, subject_template, body_template, html_template, variables, default_channels, is_active
) VALUES (
    'module_completed',
    'Modulo Completado',
    'Notificacion cuando el estudiante completa un modulo',
    '🎓 ¡Modulo completado: {{module_name}}!',
    '¡Excelente {{student_name}}!

🎓 Has completado el modulo:
📚 {{module_name}}

✨ XP ganados: {{xp_earned}}
📅 Fecha de completado: {{completion_date}}

¡Continua con el siguiente modulo!',
    NULL,
    '["student_name", "module_name", "xp_earned", "completion_date"]'::jsonb,
    ARRAY['in_app'],
    true
) ON CONFLICT (template_key, version) DO NOTHING;

-- Template 11: Desafio recibido
INSERT INTO notifications.notification_templates (
    template_key, name, description, subject_template, body_template, html_template, variables, default_channels, is_active
) VALUES (
    'challenge_received',
    'Desafio Recibido',
    'Notificacion cuando un estudiante recibe un desafio',
    '⚔️ ¡{{challenger_name}} te ha desafiado!',
    'Hola {{student_name}},

{{challenger_name}} te ha enviado un desafio:

⚔️ {{challenge_name}}
📝 {{challenge_description}}
⏰ Tiempo limite: {{time_limit}}

¿Aceptas el reto?',
    NULL,
    '["student_name", "challenger_name", "challenge_name", "challenge_description", "time_limit", "accept_url"]'::jsonb,
    ARRAY['in_app', 'push'],
    true
) ON CONFLICT (template_key, version) DO NOTHING;

-- Template 12: Desafio completado
INSERT INTO notifications.notification_templates (
    template_key, name, description, subject_template, body_template, html_template, variables, default_channels, is_active
) VALUES (
    'challenge_completed',
    'Desafio Completado',
    'Notificacion cuando se completa un desafio',
    '🏅 ¡Desafio completado!',
    '¡Bien hecho {{student_name}}!

🏅 Has completado el desafio:
⚔️ {{challenge_name}}

Resultado: {{result}}
🏆 Ganador: {{winner_name}}

XP ganados: {{xp_earned}}',
    NULL,
    '["student_name", "challenge_name", "result", "winner_name", "xp_earned"]'::jsonb,
    ARRAY['in_app'],
    true
) ON CONFLICT (template_key, version) DO NOTHING;

-- Template 13: Resumen diario (para padres/tutores)
INSERT INTO notifications.notification_templates (
    template_key, name, description, subject_template, body_template, html_template, variables, default_channels, is_active
) VALUES (
    'daily_summary',
    'Resumen Diario',
    'Resumen diario de actividad para padres/tutores',
    'Resumen diario de {{student_name}} - {{date}}',
    'Resumen de actividad de {{student_name}}

📅 Fecha: {{date}}

📊 Actividad del dia:
• Tiempo de estudio: {{study_time}} minutos
• Ejercicios completados: {{exercises_completed}}
• XP ganados: {{xp_earned}}
• Logros desbloqueados: {{achievements_count}}

📈 Progreso general: {{progress_percentage}}%',
    NULL,
    '["student_name", "date", "study_time", "exercises_completed", "xp_earned", "achievements_count", "progress_percentage"]'::jsonb,
    ARRAY['email'],
    true
) ON CONFLICT (template_key, version) DO NOTHING;

-- Template 14: Reporte semanal
INSERT INTO notifications.notification_templates (
    template_key, name, description, subject_template, body_template, html_template, variables, default_channels, is_active
) VALUES (
    'weekly_report',
    'Reporte Semanal',
    'Reporte semanal de progreso',
    'Reporte semanal de {{student_name}} - Semana {{week_number}}',
    'Reporte semanal de {{student_name}}

📅 Semana: {{week_number}} ({{week_start}} - {{week_end}})

📊 Resumen de la semana:
• Dias activos: {{active_days}}/7
• Tiempo total de estudio: {{total_study_time}} horas
• Modulos avanzados: {{modules_progress}}
• Ejercicios completados: {{exercises_completed}}
• XP totales ganados: {{total_xp}}

🏆 Posicion en ranking: #{{ranking_position}}',
    NULL,
    '["student_name", "week_number", "week_start", "week_end", "active_days", "total_study_time", "modules_progress", "exercises_completed", "total_xp", "ranking_position"]'::jsonb,
    ARRAY['email'],
    true
) ON CONFLICT (template_key, version) DO NOTHING;

-- Template 15: Reporte mensual
INSERT INTO notifications.notification_templates (
    template_key, name, description, subject_template, body_template, html_template, variables, default_channels, is_active
) VALUES (
    'monthly_report',
    'Reporte Mensual',
    'Reporte mensual de progreso',
    'Reporte mensual de {{student_name}} - {{month_name}} {{year}}',
    'Reporte mensual de {{student_name}}

📅 Mes: {{month_name}} {{year}}

📊 Resumen del mes:
• Dias activos: {{active_days}}
• Modulos completados: {{modules_completed}}
• Logros desbloqueados: {{achievements_unlocked}}
• XP totales: {{total_xp}}
• ML Coins ganados: {{total_coins}}

📈 Comparacion con mes anterior:
• Progreso: {{progress_comparison}}',
    NULL,
    '["student_name", "month_name", "year", "active_days", "modules_completed", "achievements_unlocked", "total_xp", "total_coins", "progress_comparison"]'::jsonb,
    ARRAY['email'],
    true
) ON CONFLICT (template_key, version) DO NOTHING;

-- Template 16: Alerta de bajo rendimiento
INSERT INTO notifications.notification_templates (
    template_key, name, description, subject_template, body_template, html_template, variables, default_channels, is_active
) VALUES (
    'low_performance',
    'Alerta de Bajo Rendimiento',
    'Alerta cuando el estudiante tiene bajo rendimiento',
    '⚠️ Alerta de rendimiento - {{student_name}}',
    'Estimado padre/tutor,

Queremos informarle sobre el rendimiento de {{student_name}}:

⚠️ Se ha detectado bajo rendimiento en:
📚 Modulo: {{module_name}}
📊 Promedio actual: {{average_score}}%
📉 Tendencia: {{trend}}

Recomendaciones:
{{recommendations}}

El equipo docente esta disponible para ayudar.',
    NULL,
    '["student_name", "module_name", "average_score", "trend", "recommendations", "teacher_contact"]'::jsonb,
    ARRAY['email'],
    true
) ON CONFLICT (template_key, version) DO NOTHING;

-- Template 17: Alerta de inactividad
INSERT INTO notifications.notification_templates (
    template_key, name, description, subject_template, body_template, html_template, variables, default_channels, is_active
) VALUES (
    'inactivity_alert',
    'Alerta de Inactividad',
    'Alerta cuando el estudiante no ha ingresado en varios dias',
    '¡Te extrañamos {{student_name}}! 📚',
    'Hola {{student_name}},

¡Te hemos extrañado! Han pasado {{days_inactive}} dias desde tu ultima visita.

Tu racha actual: {{current_streak}} dias (¡no la pierdas!)

Mientras estuviste fuera:
• Nuevos ejercicios disponibles: {{new_exercises}}
• Desafios pendientes: {{pending_challenges}}

¡Regresa y continua tu aventura de aprendizaje!',
    NULL,
    '["student_name", "days_inactive", "current_streak", "new_exercises", "pending_challenges", "return_url"]'::jsonb,
    ARRAY['email'],
    true
) ON CONFLICT (template_key, version) DO NOTHING;

-- Template 18: Ejercicio enviado (confirmacion)
INSERT INTO notifications.notification_templates (
    template_key, name, description, subject_template, body_template, html_template, variables, default_channels, is_active
) VALUES (
    'exercise_submitted',
    'Ejercicio Enviado',
    'Confirmacion de que el ejercicio fue enviado exitosamente',
    '✅ Ejercicio enviado: {{exercise_title}}',
    'Hola {{student_name}},

¡Tu ejercicio ha sido enviado exitosamente!

📝 Ejercicio: {{exercise_title}}
📚 Modulo: {{module_name}}
📅 Enviado: {{submitted_at}}

Tu profesor revisara tu trabajo y te notificara cuando sea calificado.

¡Sigue aprendiendo!

Equipo Gamilit',
    '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #4A90E2, #5CB85C); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">✅ ¡Ejercicio Enviado!</h2>
    </div>
    <div style="padding: 20px; background: #f9f9f9;">
        <p>Hola <strong>{{student_name}}</strong>,</p>
        <p>Tu ejercicio ha sido enviado exitosamente.</p>
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>📝 Ejercicio:</strong> {{exercise_title}}</p>
            <p><strong>📚 Modulo:</strong> {{module_name}}</p>
            <p><strong>📅 Enviado:</strong> {{submitted_at}}</p>
        </div>
        <p style="color: #666;">Tu profesor revisara tu trabajo y te notificara cuando sea calificado.</p>
    </div>
    <div style="background: #333; color: white; padding: 10px; text-align: center; border-radius: 0 0 8px 8px;">
        <small>Equipo Gamilit</small>
    </div>
</body>
</html>',
    '["student_name", "exercise_title", "module_name", "submitted_at", "requires_manual_grading", "score", "max_score"]'::jsonb,
    ARRAY['in_app', 'email'],
    true
) ON CONFLICT (template_key, version) DO NOTHING;

-- Note: 18 plantillas predefinidas para notificaciones del sistema (BD-P04: propagated from staging 2026-02-26)
