import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Account } from '../accounts/entities/account.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Authentication Service
 * Handles user registration, login, and token management
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
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
}
