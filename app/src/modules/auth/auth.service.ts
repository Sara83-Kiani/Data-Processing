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
import { Invitation } from '../invitations/entities/invitation.entity';

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

    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private frontendUrl(): string {
    return process.env.FRONTEND_URL ?? 'http://localhost:5173';
  }

  private apiBaseUrl(): string {
    return process.env.API_BASE_URL ?? 'http://localhost:3000';
  }

  private lockMinutes(): number {
    const n = Number(process.env.AUTH_LOCK_MINUTES ?? 15);
    return Number.isFinite(n) && n > 0 ? n : 15;
  }

  private activationTtlHours(): number {
    const n = Number(process.env.ACTIVATION_TOKEN_TTL_HOURS ?? 24);
    return Number.isFinite(n) && n > 0 ? n : 24;
  }

  private async sendActivationEmail(email: string, token: string): Promise<void> {
    const activationLink =
      `${this.apiBaseUrl()}/auth/activate?token=${encodeURIComponent(token)}`;
    await this.mailService.sendActivationEmail(email, activationLink, this.activationTtlHours());
  }

async register(dto: RegisterDto): Promise<{ message: string }> {
  const email = dto.email.trim().toLowerCase();

  const exists = await this.accountRepo.findOne({ where: { email } });
  if (exists) throw new BadRequestException('Email is already registered.');

  // If invitation code provided, validate it matches
  let inviterAccountId: number | null = null;
  if (dto.invitationCode) {
    const inv = await this.invitationRepo.findOne({
      where: { invitationCode: dto.invitationCode, status: 'PENDING' as any },
    });

    if (!inv) throw new BadRequestException('Invalid invitation code.');
    if (inv.inviteeEmail?.toLowerCase() !== email) {
      throw new BadRequestException('Invitation email does not match.');
    }
    inviterAccountId = inv.inviterAccountId;
  }

  const passwordHash = await bcrypt.hash(dto.password, 10);

  // ✅ create a SINGLE entity (no save(create()) and no "as any")
  const account = this.accountRepo.create({
    email,
    isActivated: false,
    isBlocked: false,
    subscriptionId: null,
    paymentMethod: null,
    referralCode: null,
    referredByAccountId: inviterAccountId,
    isTrialUsed: false,
  });

  // set password hash via method (since password is private)
  account.setPassword(passwordHash);

  // save ONCE
  const savedAccount = await this.accountRepo.save(account);

  // if invitation was used, attach invitee + mark accepted
  if (dto.invitationCode) {
    await this.invitationRepo.update(
      { invitationCode: dto.invitationCode },
      {
        inviteeAccountId: savedAccount.accountId,
        acceptedAt: new Date(),
        status: 'ACCEPTED' as any,
      } as any,
    );
  }

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


  async activateAccount(token: string): Promise<void> {
    if (!token) throw new BadRequestException('Missing activation token.');

    const row = await this.activationRepo.findOne({
      where: { token },
      relations: ['account'],
    });

    if (!row) throw new BadRequestException('Invalid activation token.');
    if (row.expiresAt.getTime() < Date.now()) throw new BadRequestException('Activation token expired.');

    row.account.isActivated = true;
    await this.accountRepo.save(row.account);
    await this.activationRepo.delete({ token });
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const email = dto.email.trim().toLowerCase();
    const account = await this.accountRepo.findOne({ where: { email } });

    if (!account) throw new UnauthorizedException('Invalid email or password.');
    if (account.isBlocked) throw new ForbiddenException('This account is blocked.');
    if (!account.isActivated) throw new ForbiddenException('Please verify your email before logging in.');
    if (account.isLockedNow()) throw new HttpException('Too many failed attempts. Try again later.', 423);

    const ok = await bcrypt.compare(dto.password, account.getPassword());
    if (!ok) {
      account.incrementFailedAttempts(this.lockMinutes());
      await this.accountRepo.save(account);
      throw new UnauthorizedException('Invalid email or password.');
    }

    account.resetLock();
    await this.accountRepo.save(account);

    const accessToken = await this.jwtService.signAsync({
      sub: account.accountId,
      email: account.email,
    });

    return { accessToken };
  }

  getActivatedRedirectUrl(): string {
    return `${this.frontendUrl()}/login?activated=1`;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();
    const account = await this.accountRepo.findOne({ where: { email } });

    if (!account) {
      return { message: 'If an account with that email exists, a password reset token has been sent.' };
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.passwordResetRepo.update(
      { accountId: account.accountId, isUsed: false },
      { isUsed: true },
    );

    await this.passwordResetRepo.save(
      this.passwordResetRepo.create({
        accountId: account.accountId,
        token,
        expiresAt,
        isUsed: false,
      }),
    );

    await this.mailService.sendPasswordResetToken(email, token);

    return { message: 'If an account with that email exists, a password reset token has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const resetRow = await this.passwordResetRepo.findOne({
      where: { token: dto.token },
      relations: ['account'],
    });

    if (!resetRow || !resetRow.isValid()) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    resetRow.account.setPassword(passwordHash);
    resetRow.account.resetLock();

    await this.accountRepo.save(resetRow.account);

    resetRow.isUsed = true;
    await this.passwordResetRepo.save(resetRow);

    return { message: 'Password has been reset successfully. You can now log in with your new password.' };
  }
}
