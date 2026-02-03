-- =====================================================
-- Seeds: notification_templates i18n (English translations)
-- Schema: notifications
-- Descripción: Traducciones al inglés para templates existentes
-- Relacionado: Advanced Templates Enhancement (2026-02-03)
-- =====================================================
--
-- IMPORTANTE:
-- - Ejecutar DESPUÉS de 01-notification_templates.sql
-- - Actualiza templates existentes con traducciones en inglés
-- - Los templates en español siguen funcionando como fallback
-- =====================================================

-- ========== ACTUALIZAR TEMPLATES CON TRADUCCIONES ==========

-- Template 1: Bienvenida al sistema
UPDATE notifications.notification_templates
SET
    subject_translations = '{
        "es": "¡Bienvenido a Gamilit, {{user_name}}!",
        "en": "Welcome to Gamilit, {{user_name}}!"
    }'::jsonb,
    body_translations = '{
        "es": "Hola {{user_name}},\n\n¡Bienvenido a Gamilit! Estamos emocionados de tenerte con nosotros.\n\nTu cuenta ha sido creada exitosamente con el correo: {{user_email}}\n\nEmpieza tu aventura de aprendizaje explorando nuestros módulos educativos y desbloquea logros mientras aprendes.\n\n¡Buena suerte!\n\nEquipo Gamilit",
        "en": "Hello {{user_name}},\n\nWelcome to Gamilit! We are excited to have you with us.\n\nYour account has been successfully created with the email: {{user_email}}\n\nStart your learning adventure by exploring our educational modules and unlock achievements while you learn.\n\nGood luck!\n\nGamilit Team"
    }'::jsonb,
    html_translations = '{
        "es": "<html><body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\"><h2 style=\"color: #4A90E2;\">¡Bienvenido a Gamilit, {{user_name}}!</h2><p>Estamos emocionados de tenerte con nosotros.</p><p>Tu cuenta ha sido creada exitosamente con el correo: <strong>{{user_email}}</strong></p><div style=\"background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;\"><h3>¿Qué puedes hacer ahora?</h3><ul><li>Explorar módulos educativos</li><li>Completar ejercicios interactivos</li><li>Desbloquear logros y ganar ML Coins</li><li>Competir en las tablas de clasificación</li></ul></div><p>¡Buena suerte en tu aventura de aprendizaje!</p><p style=\"color: #666; font-size: 12px;\">Equipo Gamilit</p></body></html>",
        "en": "<html><body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\"><h2 style=\"color: #4A90E2;\">Welcome to Gamilit, {{user_name}}!</h2><p>We are excited to have you with us.</p><p>Your account has been successfully created with the email: <strong>{{user_email}}</strong></p><div style=\"background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;\"><h3>What can you do now?</h3><ul><li>Explore educational modules</li><li>Complete interactive exercises</li><li>Unlock achievements and earn ML Coins</li><li>Compete in leaderboards</li></ul></div><p>Good luck on your learning adventure!</p><p style=\"color: #666; font-size: 12px;\">Gamilit Team</p></body></html>"
    }'::jsonb
WHERE template_key = 'welcome_email';

-- Template 4: Logro desbloqueado
UPDATE notifications.notification_templates
SET
    subject_translations = '{
        "es": "🏆 ¡Logro desbloqueado: {{achievement_name}}!",
        "en": "🏆 Achievement unlocked: {{achievement_name}}!"
    }'::jsonb,
    body_translations = '{
        "es": "¡Felicidades {{student_name}}!\n\n🏆 Has desbloqueado un nuevo logro:\n\n{{achievement_name}}\n{{achievement_description}}\n\n💎 Recompensa: {{ml_coins_earned}} ML Coins\n\n¡Sigue así y desbloquea más logros!",
        "en": "Congratulations {{student_name}}!\n\n🏆 You have unlocked a new achievement:\n\n{{achievement_name}}\n{{achievement_description}}\n\n💎 Reward: {{ml_coins_earned}} ML Coins\n\nKeep it up and unlock more achievements!"
    }'::jsonb,
    html_translations = '{
        "es": "<html><body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\"><div style=\"background-color: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 8px; text-align: center;\"><h2 style=\"color: #155724; margin-top: 0;\">🏆 ¡Logro Desbloqueado!</h2><p style=\"font-size: 18px;\">¡Felicidades <strong>{{student_name}}</strong>!</p><div style=\"background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;\"><div style=\"font-size: 48px; margin-bottom: 10px;\">{{achievement_icon}}</div><h3 style=\"color: #333; margin: 10px 0;\">{{achievement_name}}</h3><p style=\"color: #666;\">{{achievement_description}}</p><div style=\"background-color: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 15px;\"><strong style=\"color: #856404;\">💎 Recompensa: {{ml_coins_earned}} ML Coins</strong></div></div><p style=\"color: #28a745; font-weight: bold;\">¡Sigue así y desbloquea más logros!</p></div></body></html>",
        "en": "<html><body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\"><div style=\"background-color: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 8px; text-align: center;\"><h2 style=\"color: #155724; margin-top: 0;\">🏆 Achievement Unlocked!</h2><p style=\"font-size: 18px;\">Congratulations <strong>{{student_name}}</strong>!</p><div style=\"background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;\"><div style=\"font-size: 48px; margin-bottom: 10px;\">{{achievement_icon}}</div><h3 style=\"color: #333; margin: 10px 0;\">{{achievement_name}}</h3><p style=\"color: #666;\">{{achievement_description}}</p><div style=\"background-color: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 15px;\"><strong style=\"color: #856404;\">💎 Reward: {{ml_coins_earned}} ML Coins</strong></div></div><p style=\"color: #28a745; font-weight: bold;\">Keep it up and unlock more achievements!</p></div></body></html>"
    }'::jsonb
WHERE template_key = 'achievement_unlocked';

-- Template 8: Racha de días consecutivos
UPDATE notifications.notification_templates
SET
    subject_translations = '{
        "es": "🔥 ¡{{streak_days}} días de racha!",
        "en": "🔥 {{streak_days}} day streak!"
    }'::jsonb,
    body_translations = '{
        "es": "¡Increíble {{student_name}}!\n\n🔥 Has alcanzado una racha de {{streak_days}} días consecutivos\n\nSigue así para mantener tu racha y ganar más recompensas.\n\n💎 Bonus de racha: {{bonus_coins}} ML Coins\n\n¡No rompas la racha mañana!",
        "en": "Amazing {{student_name}}!\n\n🔥 You have reached a {{streak_days}} day streak\n\nKeep it up to maintain your streak and earn more rewards.\n\n💎 Streak bonus: {{bonus_coins}} ML Coins\n\nDon''t break the streak tomorrow!"
    }'::jsonb,
    html_translations = '{
        "es": "<html><body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\"><div style=\"background-color: #fff3e0; border: 2px solid #ff9800; padding: 20px; border-radius: 8px; text-align: center;\"><div style=\"font-size: 64px; margin: 20px 0;\">🔥</div><h2 style=\"color: #e65100; margin: 10px 0;\">¡Racha de {{streak_days}} Días!</h2><p style=\"font-size: 18px;\">¡Increíble <strong>{{student_name}}</strong>!</p><div style=\"background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;\"><p style=\"font-size: 16px; color: #333;\">Has mantenido tu racha de aprendizaje por:</p><p style=\"font-size: 48px; color: #ff9800; font-weight: bold; margin: 10px 0;\">{{streak_days}}</p><p style=\"font-size: 16px; color: #333;\">días consecutivos</p><div style=\"background-color: #fff3cd; padding: 15px; border-radius: 4px; margin-top: 20px;\"><p style=\"margin: 0; color: #856404;\"><strong>💎 Bonus de racha:</strong></p><p style=\"font-size: 24px; color: #f0ad4e; margin: 10px 0; font-weight: bold;\">+{{bonus_coins}} ML Coins</p></div></div><p style=\"color: #e65100; font-weight: bold; font-size: 16px;\">¡Sigue así para mantener tu racha!</p></div></body></html>",
        "en": "<html><body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\"><div style=\"background-color: #fff3e0; border: 2px solid #ff9800; padding: 20px; border-radius: 8px; text-align: center;\"><div style=\"font-size: 64px; margin: 20px 0;\">🔥</div><h2 style=\"color: #e65100; margin: 10px 0;\">{{streak_days}} Day Streak!</h2><p style=\"font-size: 18px;\">Amazing <strong>{{student_name}}</strong>!</p><div style=\"background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;\"><p style=\"font-size: 16px; color: #333;\">You have maintained your learning streak for:</p><p style=\"font-size: 48px; color: #ff9800; font-weight: bold; margin: 10px 0;\">{{streak_days}}</p><p style=\"font-size: 16px; color: #333;\">consecutive days</p><div style=\"background-color: #fff3cd; padding: 15px; border-radius: 4px; margin-top: 20px;\"><p style=\"margin: 0; color: #856404;\"><strong>💎 Streak bonus:</strong></p><p style=\"font-size: 24px; color: #f0ad4e; margin: 10px 0; font-weight: bold;\">+{{bonus_coins}} ML Coins</p></div></div><p style=\"color: #e65100; font-weight: bold; font-size: 16px;\">Keep it up to maintain your streak!</p></div></body></html>"
    }'::jsonb
WHERE template_key = 'streak_milestone';

-- ========== EJEMPLO: TEMPLATE CON LÓGICA CONDICIONAL HANDLEBARS ==========

-- Template nuevo: Resumen de progreso con condicionales
INSERT INTO notifications.notification_templates (
    template_key,
    name,
    description,
    subject_template,
    body_template,
    html_template,
    variables,
    default_channels,
    is_active,
    version,
    subject_translations,
    body_translations,
    html_translations
) VALUES (
    'progress_summary',
    'Resumen de Progreso Semanal',
    'Resumen semanal del progreso del estudiante con lógica condicional Handlebars',
    '{{student_name}}, tu resumen semanal está listo',
    'Hola {{student_name}},

Aquí está tu resumen de la semana:

📊 Progreso:
- Ejercicios completados: {{exercises_completed}}
- Tiempo de estudio: {{formatDate study_time "HH:mm"}} horas
- XP ganados: {{xp_earned}}

{{#if achievements_unlocked}}
🏆 ¡Desbloqueaste {{length achievements_unlocked}} {{pluralize (length achievements_unlocked) "logro" "logros"}}!
{{#each achievements_unlocked}}
  - {{this.name}}
{{/each}}
{{else}}
💪 Sigue esforzándote para desbloquear logros
{{/if}}

{{#if streak_active}}
🔥 Tu racha actual: {{streak_days}} días
{{/if}}

{{#unless has_pending_assignments}}
✅ No tienes tareas pendientes
{{else}}
⚠️ Tienes {{pending_assignments_count}} {{pluralize pending_assignments_count "tarea pendiente" "tareas pendientes"}}
{{/unless}}

¡Sigue así!',
    '<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4A90E2;">📊 Tu Resumen Semanal</h2>
    <p>Hola <strong>{{student_name}}</strong>,</p>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Progreso</h3>
        <ul style="list-style: none; padding: 0;">
            <li>📚 Ejercicios completados: <strong>{{exercises_completed}}</strong></li>
            <li>⏱️ Tiempo de estudio: <strong>{{study_hours}} horas</strong></li>
            <li>⭐ XP ganados: <strong>{{xp_earned}}</strong></li>
        </ul>
    </div>

    {{#if achievements_unlocked}}
    <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #155724; margin-top: 0;">🏆 Logros Desbloqueados ({{length achievements_unlocked}})</h3>
        <ul>
        {{#each achievements_unlocked}}
            <li>{{this.name}} - {{this.description}}</li>
        {{/each}}
        </ul>
    </div>
    {{/if}}

    {{#if streak_active}}
    <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <span style="font-size: 32px;">🔥</span>
        <p style="margin: 5px 0; font-size: 18px;">Racha activa: <strong>{{streak_days}} días</strong></p>
    </div>
    {{/if}}

    {{#unless has_pending_assignments}}
    <p style="color: #28a745;">✅ No tienes tareas pendientes</p>
    {{else}}
    <p style="color: #dc3545;">⚠️ Tienes <strong>{{pending_assignments_count}}</strong> {{pluralize pending_assignments_count "tarea pendiente" "tareas pendientes"}}</p>
    {{/unless}}

    <p style="color: #666; font-size: 12px; margin-top: 30px;">Equipo Gamilit</p>
</body>
</html>',
    '["student_name", "exercises_completed", "study_hours", "xp_earned", "achievements_unlocked", "streak_active", "streak_days", "has_pending_assignments", "pending_assignments_count"]'::jsonb,
    ARRAY['email', 'in_app'],
    true,
    1,
    '{
        "es": "{{student_name}}, tu resumen semanal está listo",
        "en": "{{student_name}}, your weekly summary is ready"
    }'::jsonb,
    '{
        "es": "Hola {{student_name}},\n\nAquí está tu resumen de la semana:\n\n📊 Progreso:\n- Ejercicios completados: {{exercises_completed}}\n- Tiempo de estudio: {{study_hours}} horas\n- XP ganados: {{xp_earned}}\n\n{{#if achievements_unlocked}}\n🏆 ¡Desbloqueaste {{length achievements_unlocked}} {{pluralize (length achievements_unlocked) \"logro\" \"logros\"}}!\n{{#each achievements_unlocked}}\n  - {{this.name}}\n{{/each}}\n{{else}}\n💪 Sigue esforzándote para desbloquear logros\n{{/if}}\n\n{{#if streak_active}}\n🔥 Tu racha actual: {{streak_days}} días\n{{/if}}\n\n{{#unless has_pending_assignments}}\n✅ No tienes tareas pendientes\n{{else}}\n⚠️ Tienes {{pending_assignments_count}} {{pluralize pending_assignments_count \"tarea pendiente\" \"tareas pendientes\"}}\n{{/unless}}\n\n¡Sigue así!",
        "en": "Hello {{student_name}},\n\nHere is your weekly summary:\n\n📊 Progress:\n- Exercises completed: {{exercises_completed}}\n- Study time: {{study_hours}} hours\n- XP earned: {{xp_earned}}\n\n{{#if achievements_unlocked}}\n🏆 You unlocked {{length achievements_unlocked}} {{pluralize (length achievements_unlocked) \"achievement\" \"achievements\"}}!\n{{#each achievements_unlocked}}\n  - {{this.name}}\n{{/each}}\n{{else}}\n💪 Keep working to unlock achievements\n{{/if}}\n\n{{#if streak_active}}\n🔥 Your current streak: {{streak_days}} days\n{{/if}}\n\n{{#unless has_pending_assignments}}\n✅ You have no pending assignments\n{{else}}\n⚠️ You have {{pending_assignments_count}} pending {{pluralize pending_assignments_count \"assignment\" \"assignments\"}}\n{{/unless}}\n\nKeep it up!"
    }'::jsonb,
    '{}'::jsonb
) ON CONFLICT (template_key, version) DO NOTHING;

-- =====================================================
-- COMENTARIO FINAL
-- =====================================================
COMMENT ON TABLE notifications.notification_templates IS 'Templates con soporte Handlebars (condicionales, loops), i18n (es/en) y versionado (v2.0 - 2026-02-03)';
