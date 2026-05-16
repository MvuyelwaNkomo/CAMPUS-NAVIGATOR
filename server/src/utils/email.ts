// server/src/utils/email.ts
// Handles all outgoing emails - verification, password reset, welcome

import nodemailer from 'nodemailer';

// ── Create transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// ── Email Templates ───────────────────────────────────────────────────────────

// Verification email
export async function sendVerificationEmail(
  toEmail: string,
  firstName: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: 'Verify Your Campus Navigator Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Campus Navigator</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Mulungushi University</p>
        </div>

        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1e3a5f; font-size: 20px; margin-top: 0;">Welcome, ${firstName}! 👋</h2>
          <p style="color: #374151; line-height: 1.6;">
            Thank you for registering on Campus Navigator. Please verify your email address to activate your account.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}"
               style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Verify My Email
            </a>
          </div>

          <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
            Or copy and paste this link into your browser:<br/>
            <a href="${verifyUrl}" style="color: #2563eb;">${verifyUrl}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2026 Campus Navigator · Mulungushi University · Kabwe, Zambia
          </p>
        </div>

      </div>
    `,
  });
}

// Password reset email
export async function sendPasswordResetEmail(
  toEmail: string,
  firstName: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: 'Reset Your Campus Navigator Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">

        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Campus Navigator</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Mulungushi University</p>
        </div>

        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1e3a5f; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #374151; line-height: 1.6;">
            Hi ${firstName}, we received a request to reset your Campus Navigator password.
            Click the button below to set a new password.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset My Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
            Or copy and paste this link into your browser:<br/>
            <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This link expires in 1 hour. If you did not request a password reset, 
            please ignore this email — your account is safe.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2026 Campus Navigator · Mulungushi University · Kabwe, Zambia
          </p>
        </div>

      </div>
    `,
  });
}

// Welcome email (sent after verification)
export async function sendWelcomeEmail(
  toEmail: string,
  firstName: string
): Promise<void> {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      toEmail,
    subject: 'Welcome to Campus Navigator! 🎓',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">

        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Campus Navigator</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Mulungushi University</p>
        </div>

        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1e3a5f; font-size: 20px; margin-top: 0;">You're all set, ${firstName}! 🎉</h2>
          <p style="color: #374151; line-height: 1.6;">
            Your Campus Navigator account has been verified. You can now log in and explore the full campus map, 
            find buildings, locate your hostel, and navigate Mulungushi University with ease.
          </p>

          <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #1e3a5f; margin: 0 0 12px; font-size: 15px;">What you can do:</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 2;">
              <li>🗺️ View the interactive campus map</li>
              <li>🏫 Find academic buildings and lecture halls</li>
              <li>🏠 Locate your hostel (Upschool or Downschool)</li>
              <li>🍽️ Discover dining and recreation facilities</li>
              <li>🔗 Access the student portal directly</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL}/login"
               style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Go to Campus Navigator
            </a>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2026 Campus Navigator · Mulungushi University · Kabwe, Zambia
          </p>
        </div>

      </div>
    `,
  });
}
