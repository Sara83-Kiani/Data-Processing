import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Account } from '../accounts/entities/account.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

/**
 * Authentication Service
 * Handles user registration, login, and token management
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user account
   */
  async register(registerDto: RegisterDto): Promise<{ message: string; accountId: number }> {
    const { email, password } = registerDto;

    // Check if email already exists
    const existingAccount = await this.accountRepository.findOne({ where: { email } });
    if (existingAccount) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Generate unique referral code
    const referralCode = this.generateReferralCode();

    // Create new account
    const account = this.accountRepository.create({
      email,
      password: hashedPassword,
      referralCode,
      isActivated: false,
    });

    const savedAccount = await this.accountRepository.save(account);

    // TODO: Send activation email with token
    // For now, we'll auto-activate for testing
    savedAccount.isActivated = true;
    await this.accountRepository.save(savedAccount);

    return {
      message: 'Account created successfully. Please check your email for activation link.',
      accountId: savedAccount.accountId,
    };
  }

  /**
   * Login user and return JWT token
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; account: any }> {
    const { email, password } = loginDto;

    // Find account by email
    const account = await this.accountRepository.findOne({ 
      where: { email },
      relations: ['profiles'],
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (account.isLocked()) {
      throw new UnauthorizedException('Account is temporarily locked. Please try again later.');
    }

    // Check if account is activated
    if (!account.isActivated) {
      throw new UnauthorizedException('Please activate your account first');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, account['password']);
    
    if (!isPasswordValid) {
      // Increment failed attempts
      account.incrementFailedAttempts();
      await this.accountRepository.save(account);
      
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    account.resetFailedAttempts();
    await this.accountRepository.save(account);

    // Generate JWT token
    const payload = { 
      sub: account.accountId, 
      email: account.email,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      account: account.toJSON(),
    };
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate unique referral code
   */
  private generateReferralCode(): string {
    return `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
  }

  /**
   * Request password reset - sends reset link via email
   * Per use case: "If a user has forgotten their password, a recovery request 
   * can be submitted, after which a new verification link will be sent."
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Find account by email
    const account = await this.accountRepository.findOne({ where: { email: email.toLowerCase() } });

    // Always return success message to prevent email enumeration attacks
    if (!account) {
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

    // Invalidate any existing reset tokens for this account
    await this.passwordResetRepository.update(
      { accountId: account.accountId, isUsed: false },
      { isUsed: true }
    );

    // Create new password reset token
    const passwordReset = this.passwordResetRepository.create({
      accountId: account.accountId,
      token,
      expiresAt,
      isUsed: false,
    });
    await this.passwordResetRepository.save(passwordReset);

    // Build reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Log the reset link (in production, this would send an email)
    console.log(`[PASSWORD RESET] Reset link for ${email}: ${resetLink}`);

    // TODO: Send actual email in production
    // await this.sendPasswordResetEmail(email, resetLink);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  /**
   * Reset password using token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Find the password reset token
    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token },
      relations: ['account'],
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is valid
    if (!passwordReset.isValid()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update account password using raw query (password is private field)
    await this.accountRepository
      .createQueryBuilder()
      .update()
      .set({ 
        password: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
        isBlocked: false,
      } as any)
      .where('account_id = :id', { id: passwordReset.accountId })
      .execute();

    // Mark token as used
    passwordReset.isUsed = true;
    await this.passwordResetRepository.save(passwordReset);

    return { message: 'Password has been reset successfully. You can now log in with your new password.' };
  }
}
