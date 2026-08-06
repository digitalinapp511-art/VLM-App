import nodemailer from 'nodemailer';

/**
 * Sends an OTP email to the user using SMTP (Hostinger or custom settings)
 * @param {string} email - Recipient email address
 * @param {string} otp - The 6-digit OTP code to send
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendEmailOtpViaSmtp = async (email, otp) => {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'support@vlmacademy.in';
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    console.warn('[EMAIL] SMTP_PASS not set in environment. Skipping SMTP sending.');
    return { success: false, message: 'SMTP credentials not configured' };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"VLM Digital Academy" <${user}>`,
    to: email,
    subject: `🔐 ${otp} is your VLM Academy Verification Code`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">VLM Digital Academy</h2>
          <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Secure Verification</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc; border-radius: 12px; text-align: center; border: 1px solid #f1f5f9;">
          <p style="color: #334155; font-size: 14px; margin: 0 0 16px 0;">Use the verification code below to complete your login or registration:</p>
          <div style="font-size: 36px; font-weight: 800; color: #1e1b4b; letter-spacing: 0.15em; margin: 10px 0; background-color: #e0e7ff; padding: 12px; border-radius: 8px; display: inline-block; font-family: monospace;">${otp}</div>
          <p style="color: #94a3b8; font-size: 11px; margin: 16px 0 0 0;">This verification code will expire in 10 minutes.</p>
        </div>
        
        <div style="margin-top: 24px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.5;">
          <p style="margin: 0;">If you did not request this verification code, please ignore this email.</p>
          <p style="margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} VLM Digital Academy. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent to ${email} successfully. Message ID: ${info.messageId}`);
    return { success: true, message: 'OTP email sent successfully via SMTP' };
  } catch (error) {
    console.error('[EMAIL] Failed to send email via SMTP:', error);
    return { success: false, message: error.message };
  }
};
