/**
 * Base Email Template
 *
 * Template HTML base para todos los emails de GAMILIT
 * Soporta estilos inline para compatibilidad con clientes de email
 */

export interface EmailTemplateData {
  title: string;
  content: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Template base HTML con estilos inline
 */
export const baseEmailTemplate = (data: EmailTemplateData): string => {
  const { title, content, actionUrl, actionText } = data;

  const actionButton = actionUrl
    ? `
      <tr>
        <td align="center" style="padding: 20px 0;">
          <a href="${actionUrl}"
             style="display: inline-block; padding: 12px 30px; background: #667eea; color: white;
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${actionText || 'Ver detalles'}
          </a>
        </td>
      </tr>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
    table { border-collapse: collapse; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">${title}</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">GAMILIT Platform</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #f9f9f9;">
              ${content}
            </td>
          </tr>

          <!-- Action Button -->
          ${actionButton}

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: white; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 12px;">
                Este es un correo automatico, por favor no respondas.
              </p>
              <p style="margin: 0; color: #999; font-size: 11px;">
                &copy; 2025 GAMILIT - Plataforma Educativa Gamificada
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Template simplificado para notificaciones genéricas
 */
export const notificationTemplate = (
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string,
): string => {
  const content = `
    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.6;">
      ${message}
    </p>
  `;

  return baseEmailTemplate({ title, content, actionUrl, actionText });
};

/**
 * Template con feature boxes (usado en bienvenida)
 */
export const featureBoxTemplate = (features: Array<{ icon: string; title: string; description: string }>): string => {
  return features
    .map(
      (feature) => `
    <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 8px;
                border-left: 4px solid #667eea; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <p style="margin: 0 0 5px 0; color: #667eea; font-size: 24px;">${feature.icon}</p>
      <p style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: bold;">
        ${feature.title}
      </p>
      <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
        ${feature.description}
      </p>
    </div>
  `,
    )
    .join('');
};

/**
 * Template para códigos o enlaces (usado en reset password, verify email)
 */
export const codeBoxTemplate = (code: string, label: string = 'Codigo'): string => {
  return `
    <div style="background: #e0e0e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; font-weight: bold; text-transform: uppercase;">
        ${label}
      </p>
      <p style="margin: 0; color: #333; font-size: 18px; font-weight: bold; word-break: break-all; font-family: monospace;">
        ${code}
      </p>
    </div>
  `;
};
