import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { MailService } from '../mail/mail.service';

import { Account } from '../accounts/entities/accounts.entity';
import { ActivationToken } from './activation-token.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    @InjectRepository(ActivationToken)
    private readonly activationRepo: Repository<ActivationToken>,

    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,

    private readonly jwtService: JwtService,

    private readonly mailService: MailService,
  ) {}

  // ===== Helpers for config values (with safe defaults) =====

  private frontendUrl(): string {
    // Where your React app runs (used for redirect to login page)
    return process.env.FRONTEND_URL ?? 'http://localhost:5173';
  }

  private apiBaseUrl(): string {
    // Where your Nest API runs (used in activation link)
    return process.env.API_BASE_URL ?? 'http://localhost:3000';
  }

  private lockMinutes(): number {
<<<<<<< HEAD
    const n = Number(process.env.AUTH_LOCK_MINUTES ?? 60);
    return Number.isFinite(n) && n > 0 ? n : 60;
=======
    // After 3 failed logins, lock account temporarily for this many minutes
    const n = Number(process.env.AUTH_LOCK_MINUTES ?? 15);
    return Number.isFinite(n) && n > 0 ? n : 15;
>>>>>>> d503f7e7 (Add watchlist feature, content warnings, and UI improvements)
  }

  private activationTtlHours(): number {
    // Activation link expires after this many hours
    const n = Number(process.env.ACTIVATION_TOKEN_TTL_HOURS ?? 24);
    return Number.isFinite(n) && n > 0 ? n : 24;
  }

  private async sendActivationEmail(email: string, token: string): Promise<void> {
    const activationLink =
      `${this.apiBaseUrl()}/auth/activate?token=${encodeURIComponent(token)}`;
    await this.mailService.sendActivationEmail(email, activationLink, this.activationTtlHours());
  }


  // REGISTER

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();

    // Check if email already exists
    const exists = await this.accountRepo.findOne({ where: { email } });
    if (exists) {
      throw new BadRequestException('Email is already registered.');
    }

    // Hash password (bcrypt -> 60 chars, matches VARCHAR(60))
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create account (not activated yet)
    const account = await this.accountRepo.save(
      this.accountRepo.create({
        email,
        password: passwordHash,
        isActivated: false,
        isBlocked: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }),
    );

    // Create activation token row
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + this.activationTtlHours() * 60 * 60 * 1000);

    await this.activationRepo.save(
      this.activationRepo.create({
        account,
        token,
        expiresAt,
      }),
    );

    // "Send" email (currently logs activation link to console)
    await this.sendActivationEmail(email, token);

    return {
      message:
        'Registration successful. Please verify your account (dev: check API console for activation link).',
    };
  }

<<<<<<< HEAD
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + this.activationTtlHours() * 60 * 60 * 1000);

  // ensure no array overload is used here
  await this.activationRepo.save(
    this.activationRepo.create({
      account: savedAccount,
      token,
      expiresAt,
    }),
  );

  await this.sendActivationEmail(email, token);

  return {
    message: 'Registration successful. Please verify your account.',
  };
}

=======
>>>>>>> d503f7e7 (Add watchlist feature, content warnings, and UI improvements)

  // ACTIVATE ACCOUNT
  async activateAccount(token: string): Promise<void> {
    if (!token) throw new BadRequestException('Missing activation token.');

    // Find activation token row + load related account
    const row = await this.activationRepo.findOne({
      where: { token },
      relations: ['account'],
    });

    if (!row) throw new BadRequestException('Invalid activation token.');
    if (row.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Activation token expired.');
    }

    // Mark account activated
    row.account.isActivated = true;
    await this.accountRepo.save(row.account);

    // Optional cleanup: delete token after use
    await this.activationRepo.delete({ token });
  }

  // LOGIN + TEMP LOCK AFTER 3 FAILS
  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const email = dto.email.trim().toLowerCase();

    const account = await this.accountRepo.findOne({ where: { email } });

    // Don't reveal which part was wrong (email vs password)
    if (!account) throw new UnauthorizedException('Invalid email or password.');

    // Permanent block (admin / system)
    if (account.isBlocked) throw new ForbiddenException('This account is blocked.');

    // Must verify email first
    if (!account.isActivated) {
      throw new ForbiddenException('Please verify your email before logging in.');
    }

    // Temporary lock check
    if (account.isLockedNow()) {
      // 423 Locked = try later
      throw new HttpException('Too many failed attempts. Try again later.', 423);
    }

    // Compare password
    const ok = await bcrypt.compare(dto.password, account.getPassword());

    if (!ok) {
      // Increase failed attempts counter and lock after 3 wrong attempts
      account.incrementFailedAttempts(this.lockMinutes());

      await this.accountRepo.save(account);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Successful login: reset counters/lock
    account.resetLock();
    await this.accountRepo.save(account);

    // Create JWT token
    const accessToken = await this.jwtService.signAsync({
      sub: account.accountId,
      email: account.email,
    });

    return { accessToken };
  }

  // redirect user to frontend login.
  getActivatedRedirectUrl(): string {
    return `${this.frontendUrl()}/login?activated=1`;
  }

  // FORGOT PASSWORD
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();
    const account = await this.accountRepo.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!account) {
      return { message: 'If an account with that email exists, a password reset token has been sent.' };
    }

    // Generate reset token
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate existing tokens for this account
    await this.passwordResetRepo.update(
      { accountId: account.accountId, isUsed: false },
      { isUsed: true },
    );

    // Create new password reset token
    await this.passwordResetRepo.save(
      this.passwordResetRepo.create({
        accountId: account.accountId,
        token,
        expiresAt,
        isUsed: false,
      }),
    );

    // Send reset email with token (not a link)
    await this.mailService.sendPasswordResetToken(email, token);

    return { message: 'If an account with that email exists, a password reset token has been sent.' };
  }

  // RESET PASSWORD
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const resetRow = await this.passwordResetRepo.findOne({
      where: { token: dto.token },
      relations: ['account'],
    });

    if (!resetRow) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (!resetRow.isValid()) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update account password
    resetRow.account.setPassword(passwordHash);
    resetRow.account.resetLock();
    await this.accountRepo.save(resetRow.account);

    // Mark token as used
    resetRow.isUsed = true;
    await this.passwordResetRepo.save(resetRow);

    return { message: 'Password has been reset successfully. You can now log in with your new password.' };
  }
}
