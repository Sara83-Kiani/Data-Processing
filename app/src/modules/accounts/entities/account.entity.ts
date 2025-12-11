import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Profile } from '../../profiles/entities/profile.entity';

/**
 * Account Entity - Represents user accounts in the system
 * Implements proper OOP principles with encapsulation
 */
@Entity('Account')
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'account_id' })
  public accountId: number;

  @Column({ unique: true, length: 50 })
  public email: string;

  @Column({ length: 60 })
  @Exclude() // Exclude password from JSON responses
  private password: string;

  @Column({ name: 'is_activated', default: false })
  public isActivated: boolean;

  @CreateDateColumn({ name: 'registration_date' })
  public registrationDate: Date;

  @Column({ name: 'subscription_id', nullable: true })
  public subscriptionId: number;

  @Column({ name: 'payment_method', nullable: true })
  public paymentMethod: string;

  @Column({ name: 'is_blocked', default: false })
  public isBlocked: boolean;

  @Column({ name: 'failed_login_attempts', default: 0 })
  private failedLoginAttempts: number;

  @Column({ name: 'locked_until', nullable: true })
  private lockedUntil: Date;

  @Column({ name: 'referral_code', unique: true, nullable: true })
  public referralCode: string;

  @Column({ name: 'referred_by_account_id', nullable: true })
  public referredByAccountId: number;

  @Column({ name: 'is_trial_used', default: false })
  public isTrialUsed: boolean;

  // Relationships
  @OneToMany(() => Profile, (profile) => profile.account)
  public profiles: Profile[];

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'referred_by_account_id' })
  public referredBy: Account;

  /**
   * Get password (protected method for internal use)
   */
  protected getPassword(): string {
    return this.password;
  }

  /**
   * Set password (protected method for internal use)
   */
  protected setPassword(password: string): void {
    this.password = password;
  }

  /**
   * Check if account is currently locked
   */
  public isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  }

  /**
   * Increment failed login attempts
   * Lock account after 3 failed attempts
   */
  public incrementFailedAttempts(): void {
    this.failedLoginAttempts++;
    if (this.failedLoginAttempts >= 3) {
      this.lockAccount();
    }
  }

  /**
   * Reset failed login attempts
   */
  public resetFailedAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    this.isBlocked = false;
  }

  /**
   * Lock account for 30 minutes
   */
  private lockAccount(): void {
    const lockDuration = 30 * 60 * 1000; // 30 minutes
    this.lockedUntil = new Date(Date.now() + lockDuration);
    this.isBlocked = true;
  }

  /**
   * Get failed attempts count (for admin purposes)
   */
  public getFailedAttempts(): number {
    return this.failedLoginAttempts;
  }

  /**
   * Validate account data
   */
  public validate(): boolean {
    return !!(this.email && this.password);
  }

  /**
   * Override toJSON to exclude sensitive data
   */
  public toJSON(): Record<string, any> {
    const { password, failedLoginAttempts, lockedUntil, ...result } = this as any;
    return result;
  }
}
