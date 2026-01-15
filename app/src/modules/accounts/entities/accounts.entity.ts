import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { Profile } from '../../profiles/entities/profile.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Invitation } from '../../invitations/entities/invitation.entity';
import { ActivationToken } from '../../auth/activation-token.entity';
import { PasswordReset } from '../../auth/entities/password-reset.entity';

@Entity({ name: 'Account' })
export class Account {
  @PrimaryGeneratedColumn({ name: 'account_id', type: 'int' })
  accountId: number;

  @Index({ unique: true })
  @Column({ name: 'email', type: 'varchar', length: 50 })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 60 })
  @Exclude()
  private password: string;

  @Column({ name: 'is_activated', type: 'boolean', default: false })
  isActivated: boolean;

  @CreateDateColumn({ name: 'registration_date', type: 'timestamp' })
  registrationDate: Date;

  @Column({ name: 'subscription_id', type: 'int', nullable: true })
  subscriptionId: number | null;

  @ManyToOne(() => Subscription, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscription_id' })
  subscription?: Subscription | null;

  @Column({ name: 'payment_method', type: 'varchar', length: 255, nullable: true })
  paymentMethod: string | null;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  private failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'datetime', nullable: true })
  private lockedUntil: Date | null;

  @Index({ unique: true })
  @Column({ name: 'referral_code', type: 'varchar', length: 50, nullable: true })
  referralCode: string | null;

  @Column({ name: 'referred_by_account_id', type: 'int', nullable: true })
  referredByAccountId: number | null;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'referred_by_account_id' })
  referredBy?: Account | null;

  @Column({ name: 'is_trial_used', type: 'boolean', default: false })
  isTrialUsed: boolean;

  // ===== Relations =====

  @OneToMany(() => Profile, (p) => p.account)
  profiles: Profile[];

  @OneToMany(() => Invitation, (i) => i.inviter)
  invitationsSent: Invitation[];

  @OneToMany(() => ActivationToken, (t) => t.account)
  activationTokens: ActivationToken[];

  @OneToMany(() => PasswordReset, (r) => r.account)
  passwordResets: PasswordReset[];

  // ===== Helpers =====

  public getPassword(): string {
    return this.password;
  }

  public setPassword(hash: string): void {
    this.password = hash;
  }

  public isLockedNow(): boolean {
    return !!this.lockedUntil && this.lockedUntil.getTime() > Date.now();
  }

  public incrementFailedAttempts(lockMinutes: number): void {
    this.failedLoginAttempts = (this.failedLoginAttempts ?? 0) + 1;

    if (this.failedLoginAttempts >= 3) {
      this.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      this.failedLoginAttempts = 0;
    }
  }

  public resetLock(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    this.isBlocked = false;
  }

  toJSON() {
    const { password, failedLoginAttempts, lockedUntil, ...rest } = this as any;
    return rest;
  }
}
