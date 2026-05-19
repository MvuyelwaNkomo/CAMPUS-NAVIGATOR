// server/src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import crypto from 'crypto';
import pool from '../db/pool';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { logAction } from '../utils/audit';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
} from '../utils/email';

// ── Register ──────────────────────────────────────────────────────────────────
export async function register(req: Request, res: Response): Promise<void> {
  const { student_number, email, password, first_name, last_name } = req.body;

  // Validate email format — accept any valid email domain
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  // Validate student number format — 9 digits, first 4 = year (e.g. 2021XXXXX)
  if (student_number && !/^\d{9}$/.test(student_number)) {
    res.status(400).json({ error: 'Student number must be 9 digits (e.g. 202100001).' });
    return;
  }

  // Validate password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      error: 'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character (@$!%*?&).'
    });
    return;
  }

  // Check email not already registered
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1', [email]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Generate email verification token
  const verification_token = crypto.randomUUID();

  // Get student role id
  const roleResult = await pool.query(
    `SELECT id FROM roles WHERE name = 'student'`
  );
  const role_id = roleResult.rows[0].id;

  // Insert user
  const result = await pool.query(
    `INSERT INTO users
      (student_number, email, password_hash, first_name, last_name, role_id, verification_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, first_name, last_name`,
    [
      student_number || null,
      email, password_hash,
      first_name, last_name,
      role_id, verification_token
    ]
  );

  const user = result.rows[0];

  // Send verification email
  try {
    await sendVerificationEmail(user.email, user.first_name, verification_token);
    console.log(`✅ Verification email sent to ${user.email}`);
  } catch (emailErr: any) {
    console.error('❌ Failed to send verification email:', emailErr.message);
    // Don't fail registration if email fails — just log it
  }

  await logAction({
    userId: user.id, action: 'CREATE_USER',
    tableName: 'users', recordId: user.id,
    description: `New student account registered: ${email}`,
    ipAddress: req.ip, userAgent: req.headers['user-agent']
  });

  res.status(201).json({
    message: `Account created! A verification link has been sent to ${email}. Please check your inbox.`,
    user: { id: user.id, email: user.email, first_name: user.first_name }
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  const { student_number, email, password } = req.body;

  // Student logs in with student_number, admin/superadmin logs in with email
  const isAdminLogin = !!email && !student_number;
  const identifier   = isAdminLogin ? email : student_number;

  if (!password || !identifier) {
    res.status(400).json({ error: 'Please provide your credentials and password.' });
    return;
  }

  // Fetch user by student_number (student) or email (admin)
  const result = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name,
            u.is_active, u.is_verified, r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE ${isAdminLogin ? 'u.email = $1' : 'u.student_number = $1'}`,
    [identifier]
  );

  if (result.rowCount === 0) {
    await logAction({
      action: 'FAILED_LOGIN',
      description: `No user found for: ${identifier}`,
      ipAddress: req.ip
    });
    res.status(401).json({
      error: isAdminLogin ? 'Invalid email or password.' : 'Invalid student number or password.'
    });
    return;
  }

  const user = result.rows[0];

  if (!user.is_active) {
    res.status(403).json({
      error: 'Your account has been deactivated. Please contact ICT support.'
    });
    return;
  }

  if (!user.is_verified) {
    res.status(403).json({
      error: 'Please verify your email address before logging in. Check your inbox for the verification link.'
    });
    return;
  }

  const passwordOk = await comparePassword(password, user.password_hash);
  if (!passwordOk) {
    await logAction({
      action: 'FAILED_LOGIN',
      userId: user.id,
      description: `Failed password attempt for: ${email}`,
      ipAddress: req.ip
    });
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  // Sign JWT
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  // Store session
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const deviceType = /Mobile|Android|iPhone/i.test(
    req.headers['user-agent'] || ''
  ) ? 'mobile' : 'desktop';

  await pool.query(
    `INSERT INTO sessions
      (user_id, token_hash, expires_at, ip_address, user_agent, device_type)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [user.id, tokenHash, expiresAt, req.ip, req.headers['user-agent'], deviceType]
  );

  // Update last_login and login_count
  await pool.query(
    `UPDATE users
     SET last_login = NOW(), login_count = login_count + 1
     WHERE id = $1`,
    [user.id]
  );

  await logAction({
    userId: user.id,
    action: 'LOGIN',
    description: `Successful login from ${deviceType}`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(400).json({ error: 'No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  await pool.query(
    `UPDATE sessions SET revoked_at = NOW() WHERE token_hash = $1`,
    [tokenHash]
  );

  await logAction({
    userId: req.user?.userId,
    action: 'LOGOUT',
    ipAddress: req.ip
  });

  res.status(200).json({ message: 'Logged out successfully.' });
}

// ── Verify Email ──────────────────────────────────────────────────────────────
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.query as { token: string };

  const result = await pool.query(
    `UPDATE users
     SET is_verified = TRUE, verification_token = NULL
     WHERE verification_token = $1 AND is_verified = FALSE
     RETURNING id, email, first_name`,
    [token]
  );

  if (result.rowCount === 0) {
    res.status(400).json({
      error: 'Invalid or already used verification link.'
    });
    return;
  }

  const user = result.rows[0];

  // Send welcome email after successful verification
  try {
    await sendWelcomeEmail(user.email, user.first_name);
    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (emailErr: any) {
    console.error('❌ Failed to send welcome email:', emailErr.message);
  }

  res.status(200).json({
    message: 'Email verified successfully! You can now log in to Campus Navigator.'
  });
}

// ── Forgot Password ───────────────────────────────────────────────────────────
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  const result = await pool.query(
    `SELECT id, first_name FROM users WHERE email = $1 AND is_active = TRUE`,
    [email]
  );

  // Always return 200 — prevents email enumeration attacks
  if (result.rowCount && result.rowCount > 0) {
    const user = result.rows[0];
    const reset_token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `UPDATE users
       SET reset_token = $1, reset_token_expires = $2
       WHERE id = $3`,
      [reset_token, expires, user.id]
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, user.first_name, reset_token);
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailErr: any) {
      console.error('❌ Failed to send reset email:', emailErr.message);
    }

    await logAction({
      userId: user.id,
      action: 'PASSWORD_RESET',
      description: 'Password reset requested',
      ipAddress: req.ip
    });
  }

  res.status(200).json({
    message: 'If an account with that email exists, a reset link has been sent.'
  });
}

// ── Reset Password ────────────────────────────────────────────────────────────
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, new_password } = req.body;

  // Validate new password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(new_password)) {
    res.status(400).json({
      error: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character.'
    });
    return;
  }

  const result = await pool.query(
    `SELECT id FROM users
     WHERE reset_token = $1 AND reset_token_expires > NOW()`,
    [token]
  );

  if (result.rowCount === 0) {
    res.status(400).json({
      error: 'Invalid or expired reset link. Please request a new one.'
    });
    return;
  }

  const user = result.rows[0];
  const password_hash = await hashPassword(new_password);

  await pool.query(
    `UPDATE users
     SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
     WHERE id = $2`,
    [password_hash, user.id]
  );

  // Revoke all existing sessions for security
  await pool.query(
    `UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1`,
    [user.id]
  );

  res.status(200).json({
    message: 'Password reset successfully. Please log in with your new password.'
  });
}

// ── Get Current User ──────────────────────────────────────────────────────────
export async function getMe(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT u.id, u.email, u.first_name, u.last_name,
            u.student_number, u.last_login, u.login_count,
            r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [req.user?.userId]
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.status(200).json({ user: result.rows[0] });
}
