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

// ❌ Mail disabled for now
// import * as nodemailer from 'nodemailer';

import { Account } from '../accounts/accounts.entity';
import { ActivationToken } from './activation-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    @InjectRepository(ActivationToken)
    private readonly activationRepo: Repository<ActivationToken>,

    private readonly jwtService: JwtService,
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
    // After 3 failed logins, lock account temporarily for this many minutes
    const n = Number(process.env.AUTH_LOCK_MINUTES ?? 15);
    return Number.isFinite(n) && n > 0 ? n : 15;
  }

  private activationTtlHours(): number {
    // Activation link expires after this many hours
    const n = Number(process.env.ACTIVATION_TOKEN_TTL_HOURS ?? 24);
    return Number.isFinite(n) && n > 0 ? n : 24;
  }

  /**
   * MAIL DISABLED (for now)
   *
   * In the real use case, this should send an email containing the activation link.
   * For development/testing, we only print the activation link in the server console.
   *
   * Later, when you want email:
   *  - uncomment nodemailer import above
   *  - install nodemailer (npm i nodemailer)
   *  - read SMTP_* variables from .env
   *  - send the email below (sample code is included and commented out)
   */
  private async sendActivationEmail(email: string, token: string): Promise<void> {
    const activationLink =
      `${this.apiBaseUrl()}/auth/activate?token=${encodeURIComponent(token)}`;

    // ✅ Dev: log activation link
    // eslint-disable-next-line no-console
    console.log(`[DEV] Activation link for ${email}: ${activationLink}`);

    // -----------------------------------------------------------------------
    // 💤 Email sending intentionally disabled for now.
    //
    // const host = process.env.SMTP_HOST;
    // const user = process.env.SMTP_USER;
    // const pass = process.env.SMTP_PASS;
    // const port = Number(process.env.SMTP_PORT ?? 587);
    // const from = process.env.SMTP_FROM ?? 'no-reply@streamflix.local';
    //
    // if (!host || !user || !pass) {
    //   console.log(`[DEV] No SMTP configured. Activation link: ${activationLink}`);
    //   return;
    // }
    //
    // const transporter = nodemailer.createTransport({
    //   host,
    //   port,
    //   secure: port === 465,
    //   auth: { user, pass },
    // });
    //
    // await transporter.sendMail({
    //   from,
    //   to: email,
    //   subject: 'Verify your account',
    //   text: `Click this link to activate your account:\n\n${activationLink}\n\nThis link expires in ${this.activationTtlHours()} hours.`,
    //   html: `
    //     <p>Click this link to activate your account:</p>
    //     <p><a href="${activationLink}">Activate account</a></p>
    //     <p>This link expires in ${this.activationTtlHours()} hours.</p>
    //   `,
    // });
    // -----------------------------------------------------------------------
  }

  // =========================
  // 1) REGISTER
  // =========================
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();

    // 1) Check if email already exists
    const exists = await this.accountRepo.findOne({ where: { email } });
    if (exists) {
      throw new BadRequestException('Email is already registered.');
    }

    // 2) Hash password (bcrypt -> 60 chars, matches VARCHAR(60))
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3) Create account (not activated yet)
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

    // 4) Create activation token row
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + this.activationTtlHours() * 60 * 60 * 1000);

    await this.activationRepo.save(
      this.activationRepo.create({
        account,
        token,
        expiresAt,
      }),
    );

    // 5) "Send" email (currently logs activation link to console)
    await this.sendActivationEmail(email, token);

    return {
      message:
        'Registration successful. Please verify your account (dev: check API console for activation link).',
    };
  }

  // =========================
  // 2) ACTIVATE ACCOUNT (via link)
  // =========================
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

  // =========================
  // 3) LOGIN + TEMP LOCK AFTER 3 FAILS
  // =========================
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
    if (account.lockedUntil && account.lockedUntil.getTime() > Date.now()) {
      // 423 Locked = good semantic status for "try later"
      throw new HttpException('Too many failed attempts. Try again later.', 423);
    }

    // Compare password
    const ok = await bcrypt.compare(dto.password, account.password);

    if (!ok) {
      // Increase failed attempts counter
      account.failedLoginAttempts = (account.failedLoginAttempts ?? 0) + 1;

      // Lock after 3 wrong attempts
      if (account.failedLoginAttempts >= 3) {
        account.lockedUntil = new Date(Date.now() + this.lockMinutes() * 60 * 1000);

        // Reset counter after lock
        account.failedLoginAttempts = 0;
      }

      await this.accountRepo.save(account);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Successful login: reset counters/lock
    account.failedLoginAttempts = 0;
    account.lockedUntil = null;
    await this.accountRepo.save(account);

    // Create JWT token
    const accessToken = await this.jwtService.signAsync({
      sub: account.id,
      email: account.email,
    });

    return { accessToken };
  }

  /**
   * After activation, we redirect user to frontend login.
   * Frontend reads ?activated=1 and shows popup:
   * "registration is complete, you can log in"
   */
  getActivatedRedirectUrl(): string {
    return `${this.frontendUrl()}/login?activated=1`;
  }
}
