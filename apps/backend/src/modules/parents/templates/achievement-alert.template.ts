/**
 * Achievement Alert Email Template
 *
 * EXT-010 Parent Notifications
 *
 * @description HTML email template for achievement unlock notifications.
 * @created 2026-01-27
 */

export interface AchievementAlertTemplateData {
  parentName: string;
  studentName: string;
  achievementName: string;
  achievementDescription: string;
  achievementIcon: string;
  xpReward: number;
  coinsReward: number;
  currentLevel: number;
  currentRank: string;
  totalAchievements: number;
  dashboardUrl: string;
  unsubscribeUrl: string;
}

/**
 * Generate achievement alert HTML email
 */
export function generateAchievementAlertHtml(data: AchievementAlertTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Logro - ${escapeHtml(data.studentName)}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">${escapeHtml(data.achievementIcon) || ''}</div>
      <h1 style="margin: 0 0 10px 0; font-size: 24px;">Nuevo Logro Desbloqueado!</h1>
      <div style="font-size: 14px; opacity: 0.9;">${escapeHtml(data.studentName)}</div>
    </div>

    <!-- Achievement Card -->
    <div style="padding: 30px; text-align: center;">
      <div style="background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%); color: #333; padding: 30px; border-radius: 15px; display: inline-block; min-width: 280px; box-shadow: 0 4px 15px rgba(255,193,7,0.3);">
        <h2 style="margin: 0 0 10px 0; font-size: 22px; color: #333;">${escapeHtml(data.achievementName)}</h2>
        <p style="margin: 0 0 20px 0; color: #555;">${escapeHtml(data.achievementDescription)}</p>
        <div style="display: inline-block; background: rgba(0,0,0,0.1); padding: 10px 20px; border-radius: 20px;">
          <span style="font-weight: bold;">+${data.xpReward} XP</span>
          ${data.coinsReward > 0 ? `<span style="margin-left: 15px; font-weight: bold;">+${data.coinsReward} ML Coins</span>` : ''}
        </div>
      </div>
    </div>

    <!-- Student Stats -->
    <div style="padding: 0 30px 30px;">
      <table cellpadding="0" cellspacing="10" border="0" width="100%">
        <tr>
          <td style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; width: 33%;">
            <div style="font-size: 24px; font-weight: bold; color: #4caf50;">${data.currentLevel}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Nivel Actual</div>
          </td>
          <td style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; width: 33%;">
            <div style="font-size: 24px; font-weight: bold; color: #4caf50;">${escapeHtml(data.currentRank)}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Rango</div>
          </td>
          <td style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; width: 33%;">
            <div style="font-size: 24px; font-weight: bold; color: #4caf50;">${data.totalAchievements}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Logros Totales</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Message -->
    <div style="padding: 20px 30px; background: #e8f5e9; margin: 0 20px 20px; border-radius: 8px;">
      <p style="margin: 0; color: #2e7d32;">
        <strong>Hola ${escapeHtml(data.parentName)},</strong><br><br>
        Nos complace informarte que ${escapeHtml(data.studentName)} ha desbloqueado un nuevo logro en GAMILIT.
        Este es un gran paso en su camino de aprendizaje. Te invitamos a felicitarlo/a por su esfuerzo!
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; padding: 20px 30px 30px;">
      <a href="${escapeHtml(data.dashboardUrl)}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">
        Ver Todos los Logros
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f9f9f9;">
      <p style="margin: 0 0 10px 0;">Este es un correo automatico de GAMILIT.</p>
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
