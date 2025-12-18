/**
 * Email Templates para Notificaciones
 *
 * Templates específicos para cada tipo de notificación del sistema
 */

import { baseEmailTemplate } from './base.template';

/**
 * Template para notificación de logro desbloqueado
 */
export const achievementUnlockedTemplate = (data: {
  userName: string;
  achievementName: string;
  achievementDescription: string;
  achievementIcon: string;
  xpEarned: number;
  coinsEarned: number;
  dashboardUrl: string;
}): string => {
  const content = `
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
      Hola <strong>${data.userName}</strong>,
    </p>
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
      Has desbloqueado un nuevo logro!
    </p>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px;
                text-align: center; border-radius: 8px; margin: 20px 0;">
      <div style="font-size: 64px; margin-bottom: 15px;">${data.achievementIcon}</div>
      <h2 style="margin: 0 0 10px 0; color: white; font-size: 24px;">${data.achievementName}</h2>
      <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">
        ${data.achievementDescription}
      </p>
    </div>

    <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-size: 16px; font-weight: bold;">Recompensas:</p>
      <p style="margin: 0; color: #666; font-size: 14px;">
        XP ganados: <strong style="color: #667eea;">+${data.xpEarned}</strong>
      </p>
      <p style="margin: 0; color: #666; font-size: 14px;">
        ML Coins ganados: <strong style="color: #f59e0b;">+${data.coinsEarned}</strong>
      </p>
    </div>

    <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
      Sigue asi!
    </p>
  `;

  return baseEmailTemplate({
    title: 'Logro Desbloqueado!',
    content,
    actionUrl: data.dashboardUrl,
    actionText: 'Ver en Dashboard',
  });
};

/**
 * Template para asignación de tarea
 */
export const assignmentDueTemplate = (data: {
  userName: string;
  assignmentTitle: string;
  dueDate: string;
  teacherName: string;
  assignmentUrl: string;
}): string => {
  const content = `
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
      Hola <strong>${data.userName}</strong>,
    </p>
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
      Tienes una nueva tarea asignada por <strong>${data.teacherName}</strong>.
    </p>

    <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #667eea; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">${data.assignmentTitle}</h3>
      <p style="margin: 0; color: #666; font-size: 14px;">
        Fecha de entrega: <strong style="color: #dc2626;">${data.dueDate}</strong>
      </p>
    </div>

    <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
      No olvides completarla a tiempo para ganar puntos y recompensas!
    </p>
  `;

  return baseEmailTemplate({
    title: 'Nueva Tarea Asignada',
    content,
    actionUrl: data.assignmentUrl,
    actionText: 'Ver Tarea',
  });
};

/**
 * Template para recordatorio de tarea próxima a vencer
 */
export const assignmentReminderTemplate = (data: {
  userName: string;
  assignmentTitle: string;
  hoursRemaining: number;
  assignmentUrl: string;
}): string => {
  const content = `
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
      Hola <strong>${data.userName}</strong>,
    </p>
    <p style="margin: 0 0 20px 0; color: #dc2626; font-size: 16px; font-weight: bold;">
      Recordatorio: Tu tarea esta proxima a vencer!
    </p>

    <div style="background: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">${data.assignmentTitle}</h3>
      <p style="margin: 0; color: #666; font-size: 14px;">
        Tiempo restante: <strong style="color: #dc2626;">${data.hoursRemaining} horas</strong>
      </p>
    </div>

    <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
      No pierdas la oportunidad de completarla y ganar recompensas!
    </p>
  `;

  return baseEmailTemplate({
    title: 'Recordatorio: Tarea Proxima a Vencer',
    content,
    actionUrl: data.assignmentUrl,
    actionText: 'Completar Ahora',
  });
};

/**
 * Template para nuevo mensaje social
 */
export const newMessageTemplate = (data: {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  messageUrl: string;
}): string => {
  const content = `
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
      Hola <strong>${data.recipientName}</strong>,
    </p>
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
      <strong>${data.senderName}</strong> te ha enviado un mensaje.
    </p>

    <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 4px;">
      <p style="margin: 0; color: #666; font-size: 14px; font-style: italic;">
        "${data.messagePreview}"
      </p>
    </div>

    <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
      Responde para mantener la conversacion!
    </p>
  `;

  return baseEmailTemplate({
    title: 'Nuevo Mensaje',
    content,
    actionUrl: data.messageUrl,
    actionText: 'Ver Mensaje',
  });
};

/**
 * Template para subida de nivel/rango
 */
export const levelUpTemplate = (data: {
  userName: string;
  newLevel: string;
  newRank: string;
  rankIcon: string;
  benefitsUnlocked: string[];
  dashboardUrl: string;
}): string => {
  const benefits = data.benefitsUnlocked
    .map((benefit) => `<li style="margin: 5px 0; color: #666;">${benefit}</li>`)
    .join('');

  const content = `
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
      Felicidades <strong>${data.userName}</strong>!
    </p>
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
      Has alcanzado un nuevo nivel!
    </p>

    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px;
                text-align: center; border-radius: 8px; margin: 20px 0;">
      <div style="font-size: 64px; margin-bottom: 15px;">${data.rankIcon}</div>
      <h2 style="margin: 0 0 10px 0; color: white; font-size: 28px;">${data.newRank}</h2>
      <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">
        Nivel ${data.newLevel}
      </p>
    </div>

    <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #333; font-size: 16px; font-weight: bold;">
        Beneficios Desbloqueados:
      </p>
      <ul style="margin: 0; padding-left: 20px;">
        ${benefits}
      </ul>
    </div>

    <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
      Continua aprendiendo para alcanzar el siguiente nivel!
    </p>
  `;

  return baseEmailTemplate({
    title: 'Felicidades! Has Subido de Nivel!',
    content,
    actionUrl: data.dashboardUrl,
    actionText: 'Ver Progreso',
  });
};

/**
 * Template para notificación genérica del sistema
 */
export const systemNotificationTemplate = (data: {
  userName: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}): string => {
  const content = `
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
      Hola <strong>${data.userName}</strong>,
    </p>
    <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6;">
      ${data.message}
    </p>
  `;

  return baseEmailTemplate({
    title: 'Notificacion del Sistema',
    content,
    actionUrl: data.actionUrl,
    actionText: data.actionText,
  });
};
