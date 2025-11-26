/**
 * Email notification utility
 * 
 * To enable email notifications:
 * 1. Install Resend: npm install resend
 * 2. Add RESEND_API_KEY to your .env.local file
 * 3. Verify your domain with Resend or use their test email
 */

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  // Check if Resend is configured
  const apiKey = process.env.RESEND_API_KEY
  
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email notification skipped.')
    console.log('📧 Would have sent email to:', to)
    console.log('📝 Subject:', subject)
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to send email:', error)
      return false
    }

    console.log('✅ Email sent successfully to:', to)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export function generateNewLeadEmailHTML(lead: {
  name: string
  phoneNumber: string
  email: string | null
  destination: string | null
  status: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .field {
      margin: 15px 0;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border-left: 3px solid #0ea5e9;
    }
    .field-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .field-value {
      font-size: 16px;
      color: #111827;
      font-weight: 500;
    }
    .cta {
      text-align: center;
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      background: #0ea5e9;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">🎉 New Lead Received!</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">A new potential client has contacted Voyages Classy</p>
  </div>
  
  <div class="content">
    <div class="field">
      <div class="field-label">Client Name</div>
      <div class="field-value">${lead.name}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Phone Number</div>
      <div class="field-value">${lead.phoneNumber}</div>
    </div>
    
    ${lead.email ? `
    <div class="field">
      <div class="field-label">Email</div>
      <div class="field-value">${lead.email}</div>
    </div>
    ` : ''}
    
    ${lead.destination ? `
    <div class="field">
      <div class="field-label">Destination</div>
      <div class="field-value">${lead.destination}</div>
    </div>
    ` : ''}
    
    <div class="field">
      <div class="field-label">Status</div>
      <div class="field-value" style="text-transform: capitalize;">${lead.status}</div>
    </div>
    
    <div class="cta">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/leads" class="button">
        View Lead in Dashboard →
      </a>
    </div>
    
    <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
      This is an automated notification from Voyages Classy AI.
    </p>
  </div>
</body>
</html>
  `.trim()
}

export function generateCallNotificationEmailHTML(call: {
  name: string
  phoneNumber: string
  summary: string
  duration?: string
  callId: string
  isNewLead: boolean
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .new-lead-badge {
      display: inline-block;
      background: #fbbf24;
      color: #78350f;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .field {
      margin: 15px 0;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border-left: 3px solid #10b981;
    }
    .field-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .field-value {
      font-size: 16px;
      color: #111827;
      font-weight: 500;
    }
    .summary-box {
      margin: 20px 0;
      padding: 16px;
      background: white;
      border-radius: 6px;
      border-left: 3px solid #6366f1;
    }
    .summary-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .summary-text {
      font-size: 15px;
      color: #374151;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .cta {
      text-align: center;
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">📞 New Call Received!</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Incoming call to Voyages Classy</p>
    ${call.isNewLead ? '<div class="new-lead-badge">✨ NEW LEAD</div>' : ''}
  </div>
  
  <div class="content">
    <div class="field">
      <div class="field-label">Caller Name</div>
      <div class="field-value">${call.name}</div>
    </div>
    
    <div class="field">
      <div class="field-label">Phone Number</div>
      <div class="field-value">${call.phoneNumber}</div>
    </div>
    
    ${call.duration ? `
    <div class="field">
      <div class="field-label">Duration</div>
      <div class="field-value">${call.duration}</div>
    </div>
    ` : ''}
    
    <div class="summary-box">
      <div class="summary-label">
        <span>🤖 AI Summary (GPT-4o)</span>
      </div>
      <div class="summary-text">${call.summary || 'No summary available'}</div>
    </div>
    
    <div class="cta">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/calls/unassigned" class="button">
        View Call Details →
      </a>
    </div>
    
    <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
      This is an automated notification from Voyages Classy AI.
    </p>
  </div>
</body>
</html>
  `.trim()
}

