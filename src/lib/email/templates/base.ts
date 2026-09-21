// Base email template with FarmDirect branding
export function emailTemplate(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FarmDirect</title>
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1a2e1a 0%, #2d6a4f 100%); padding: 32px 24px; text-align: center;">
        <img src="https://farmdirect.co.in/images/logo.png" alt="FarmDirect" style="height: 60px; width: auto;" />
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 32px 24px;">
        ${content}
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f0f7f0; padding: 24px; text-align: center; border-top: 1px solid #d8f3dc;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #52796f;">
          FarmDirect Daily Fresh Vegetables
        </p>
        <p style="margin: 0; font-size: 12px; color: #95d5b2;">
          Coimbatore, Tamil Nadu
        </p>
        <p style="margin: 16px 0 0; font-size: 11px; color: #95d5b2;">
          © 2026 FarmDirect Agro Ventures. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function buttonStyle(href: string, text: string, backgroundColor = '#2d6a4f'): string {
  return `
    <a href="${href}" style="display: inline-block; background-color: ${backgroundColor}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      ${text}
    </a>
  `;
}

export function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e8f0e8;">
        <span style="color: #52796f; font-size: 14px;">${label}</span>
        <span style="color: #1a2e1a; font-size: 14px; font-weight: 600; float: right;">${value}</span>
      </td>
    </tr>
  `;
}