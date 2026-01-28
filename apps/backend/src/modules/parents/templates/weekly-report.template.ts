/**
 * Weekly Report Email Template
 *
 * EXT-010 Parent Notifications
 *
 * @description HTML email template for weekly progress reports sent to parents.
 * @created 2026-01-27
 */

export interface WeeklyReportTemplateData {
  studentName: string;
  studentLevel: number;
  studentRank: string;
  weekStartDate: string;
  weekEndDate: string;
  xpEarned: number;
  exercisesCompleted: number;
  averageAccuracy: number;
  readingTimeMinutes: number;
  currentStreak: number;
  achievementsUnlocked: string[];
  areasForImprovement: string[];
  recommendations: string[];
  dashboardUrl: string;
  unsubscribeUrl: string;
}

/**
 * Generate weekly report HTML email
 */
export function generateWeeklyReportHtml(data: WeeklyReportTemplateData): string {
  const achievementsList = data.achievementsUnlocked.length > 0
    ? data.achievementsUnlocked.map((a) => `
        <div style="background: #e8f5e9; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid #4caf50;">
          ${escapeHtml(a)}
        </div>
      `).join('')
    : '<p style="color: #666;">No se desbloquearon nuevos logros esta semana.</p>';

  const improvementsList = data.areasForImprovement.length > 0
    ? data.areasForImprovement.map((a) => `
        <div style="background: #fff3e0; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid #ff9800;">
          ${escapeHtml(a)}
        </div>
      `).join('')
    : '';

  const recommendationsList = data.recommendations.length > 0
    ? data.recommendations.map((r) => `
        <div style="background: #e3f2fd; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid #2196f3;">
          ${escapeHtml(r)}
        </div>
      `).join('')
    : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Semanal - ${escapeHtml(data.studentName)}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0 0 10px 0; font-size: 24px;">Reporte Semanal de Progreso</h1>
      <div style="font-size: 14px; opacity: 0.9;">${escapeHtml(data.weekStartDate)} - ${escapeHtml(data.weekEndDate)}</div>
    </div>

    <!-- Student Card -->
    <div style="background: #f9f9f9; padding: 20px; margin: 20px; border-radius: 8px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align: middle; padding-right: 15px;">
            <div style="width: 60px; height: 60px; background: #667eea; border-radius: 50%; text-align: center; line-height: 60px; color: white; font-size: 24px; font-weight: bold;">
              ${escapeHtml(data.studentName[0].toUpperCase())}
            </div>
          </td>
          <td style="vertical-align: middle;">
            <h2 style="margin: 0; font-size: 18px;">${escapeHtml(data.studentName)}</h2>
            <p style="margin: 5px 0 0 0; color: #666;">Nivel ${data.studentLevel} - Rango ${escapeHtml(data.studentRank)}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Metrics -->
    <div style="padding: 20px;">
      <table cellpadding="0" cellspacing="10" border="0" width="100%">
        <tr>
          <td style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; width: 33%;">
            <div style="font-size: 28px; font-weight: bold; color: #667eea;">${data.xpEarned}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">XP Ganado</div>
          </td>
          <td style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; width: 33%;">
            <div style="font-size: 28px; font-weight: bold; color: #667eea;">${data.exercisesCompleted}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Ejercicios</div>
          </td>
          <td style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; width: 33%;">
            <div style="font-size: 28px; font-weight: bold; color: #667eea;">${Math.round(data.averageAccuracy)}%</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Precision</div>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; width: 33%;">
            <div style="font-size: 28px; font-weight: bold; color: #667eea;">${Math.round(data.readingTimeMinutes)}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Minutos Activo</div>
          </td>
          <td style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; width: 33%;">
            <div style="font-size: 28px; font-weight: bold; color: #667eea;">${data.currentStreak}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Dias de Racha</div>
          </td>
          <td style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; width: 33%;">
            <div style="font-size: 28px; font-weight: bold; color: #667eea;">${data.achievementsUnlocked.length}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Logros</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Achievements Section -->
    <div style="padding: 20px; border-top: 1px solid #eee;">
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Logros Desbloqueados</h3>
      ${achievementsList}
    </div>

    <!-- Improvement Areas Section -->
    ${data.areasForImprovement.length > 0 ? `
    <div style="padding: 20px; border-top: 1px solid #eee;">
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Areas de Oportunidad</h3>
      ${improvementsList}
    </div>
    ` : ''}

    <!-- Recommendations Section -->
    ${data.recommendations.length > 0 ? `
    <div style="padding: 20px; border-top: 1px solid #eee;">
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Recomendaciones</h3>
      ${recommendationsList}
    </div>
    ` : ''}

    <!-- CTA Button -->
    <div style="text-align: center; padding: 30px;">
      <a href="${escapeHtml(data.dashboardUrl)}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">
        Ver Dashboard Completo
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f9f9f9;">
      <p style="margin: 0 0 10px 0;">Este reporte fue generado automaticamente por GAMILIT.</p>
      <p style="margin: 0 0 10px 0;">
        <a href="${escapeHtml(data.unsubscribeUrl)}" style="color: #666;">Cambiar preferencias de notificacion</a>
      </p>
      <p style="margin: 0;">&copy; 2026 GAMILIT - Plataforma Educativa Gamificada</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
