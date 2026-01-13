import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT ?? 587);

    if (!host || !user || !pass) {
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      requireTLS: port === 587,
    });

    return this.transporter;
  }

  private getFromAddress(): string {
    const user = process.env.SMTP_USER;
    return process.env.SMTP_FROM ?? user ?? 'no-reply@streamflix.local';
  }

  async sendPasswordResetToken(email: string, token: string): Promise<boolean> {
    const transporter = this.getTransporter();

    if (!transporter) {
      this.logger.warn(`[DEV] No SMTP configured. Password reset token for ${email}: ${token}`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: 'Password Reset Token',
        text:
          `You requested a password reset.\n\n` +
          `Your password reset token is:\n\n${token}\n\n` +
          `Enter this token on the reset password page to set a new password.\n\n` +
          `This token expires in 1 hour.\n\n` +
          `If you didn't request this, please ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You requested a password reset for your account.</p>
            <p>Your password reset token is:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <code style="font-size: 18px; font-weight: bold; color: #333; letter-spacing: 1px;">${token}</code>
            </div>
            <p>Enter this token on the reset password page to set a new password.</p>
            <p><strong>This token expires in 1 hour.</strong></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">If you didn't request this password reset, please ignore this email.</p>
          </div>
        `,
      });
      return true;
    } catch (err) {
      this.logger.error('[MAIL] Failed to send password reset email:', err);
      this.logger.warn(`[DEV] Password reset token for ${email}: ${token}`);
      return false;
    }
  }

  async sendActivationEmail(email: string, activationLink: string, ttlHours: number): Promise<boolean> {
    const transporter = this.getTransporter();

    if (!transporter) {
      this.logger.warn(`[DEV] No SMTP configured. Activation link for ${email}: ${activationLink}`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: 'Verify your account',
        text:
          `Welcome!\n\n` +
          `Click this link to activate your account:\n${activationLink}\n\n` +
          `This link expires in ${ttlHours} hours.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome!</h2>
            <p>Click the link below to activate your account:</p>
            <p><a href="${activationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Activate Account</a></p>
            <p>This link expires in ${ttlHours} hours.</p>
          </div>
        `,
      });
      return true;
    } catch (err) {
      this.logger.error('[MAIL] Failed to send activation email:', err);
      this.logger.warn(`[DEV] Activation link for ${email}: ${activationLink}`);
      return false;
    }
  }
}
