import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Account } from '../../accounts/accounts.entity';

/**
 * PasswordReset Entity
 * Stores password reset tokens for account recovery
 */
@Entity('PasswordReset')
export class PasswordReset {
  @PrimaryGeneratedColumn({ name: 'pass_reset_id' })
  passResetId: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'pass_reset_token', unique: true })
  token: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  /**
   * Check if token is expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if token is valid (not used and not expired)
   */
  isValid(): boolean {
    return !this.isUsed && !this.isExpired();
  }
}
