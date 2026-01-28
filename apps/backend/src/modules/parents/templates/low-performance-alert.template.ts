/**
 * Low Performance Alert Email Template
 *
 * EXT-010 Parent Notifications
 *
 * @description HTML email template for low performance alerts sent to parents.
 * @created 2026-01-27
 */

export interface LowPerformanceAlertTemplateData {
  parentName: string;
  studentName: string;
  exerciseType: string;
  score: number;
  threshold: number;
  recentScores: number[];
  averageScore: number;
  suggestedActions: string[];
  dashboardUrl: string;
  unsubscribeUrl: string;
}

/**
 * Generate low performance alert HTML email
 */
export function generateLowPerformanceAlertHtml(data: LowPerformanceAlertTemplateData): string {
  const actionsList = data.suggestedActions.length > 0
    ? data.suggestedActions.map((a) => `
        <li style="margin-bottom: 10px;">${escapeHtml(a)}</li>
      `).join('')
    : '<li>Revisar el progreso de tu hijo/a en el dashboard</li>';

  const recentScoresDisplay = data.recentScores.length > 0
    ? data.recentScores.map((s) => `
        <span style="display: inline-block; padding: 5px 12px; background: ${s >= data.threshold ? '#e8f5e9' : '#ffebee'}; border-radius: 15px; margin: 3px; color: ${s >= data.threshold ? '#2e7d32' : '#c62828'}; font-weight: bold;">${s}%</span>
      `).join('')
    : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alerta de Rendimiento - ${escapeHtml(data.studentName)}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f44336 0%, #c62828 100%); color: white; padding: 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;"></div>
      <h1 style="margin: 0 0 10px 0; font-size: 24px;">Alerta de Rendimiento</h1>
      <div style="font-size: 14px; opacity: 0.9;">${escapeHtml(data.studentName)}</div>
    </div>

    <!-- Alert Content -->
    <div style="padding: 30px;">
      <p style="margin: 0 0 20px 0;">
        <strong>Hola ${escapeHtml(data.parentName)},</strong>
      </p>
      <p style="margin: 0 0 20px 0;">
        Te informamos que ${escapeHtml(data.studentName)} ha obtenido un puntaje de
        <strong style="color: #c62828;">${data.score}%</strong> en un ejercicio de
        <strong>${escapeHtml(data.exerciseType)}</strong>, el cual esta por debajo
        del umbral recomendado de ${data.threshold}%.
      </p>
    </div>

    <!-- Score Display -->
    <div style="padding: 0 30px 30px;">
      <div style="background: #ffebee; border-radius: 10px; padding: 20px; text-align: center;">
        <div style="font-size: 48px; font-weight: bold; color: #c62828;">${data.score}%</div>
        <div style="font-size: 14px; color: #666; margin-top: 5px;">Puntaje Obtenido</div>
        <div style="font-size: 12px; color: #999; margin-top: 10px;">Umbral recomendado: ${data.threshold}%</div>
      </div>
    </div>

    <!-- Recent Scores -->
    ${data.recentScores.length > 0 ? `
    <div style="padding: 0 30px 30px;">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">Puntajes Recientes en ${escapeHtml(data.exerciseType)}</h3>
      <div style="text-align: center;">
        ${recentScoresDisplay}
      </div>
      <p style="text-align: center; margin-top: 15px; color: #666; font-size: 14px;">
        Promedio: <strong>${Math.round(data.averageScore)}%</strong>
      </p>
    </div>
    ` : ''}

    <!-- Suggested Actions -->
    <div style="padding: 20px 30px; background: #fff3e0; margin: 0 20px 20px; border-radius: 8px;">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #e65100;">Acciones Sugeridas</h3>
      <ul style="margin: 0; padding-left: 20px; color: #333;">
        ${actionsList}
      </ul>
    </div>

    <!-- Encouragement Message -->
    <div style="padding: 20px 30px; background: #e3f2fd; margin: 0 20px 20px; border-radius: 8px;">
      <p style="margin: 0; color: #1565c0;">
        <strong>Recuerda:</strong> Los puntajes bajos son parte del proceso de aprendizaje.
        Con practica y apoyo, tu hijo/a puede mejorar. Te invitamos a revisar su progreso
        y animarlo/a a seguir adelante.
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; padding: 20px 30px 30px;">
      <a href="${escapeHtml(data.dashboardUrl)}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">
        Ver Progreso Detallado
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f9f9f9;">
      <p style="margin: 0 0 10px 0;">Este es un correo automatico de GAMILIT.</p>
      <p style="margin: 0 0 10px 0;">
        <a href="${escapeHtml(data.unsubscribeUrl)}" style="color: #666;">Cambiar configuracion de alertas</a>
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
