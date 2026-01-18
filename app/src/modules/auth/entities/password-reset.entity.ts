import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Account } from '../../accounts/entities/accounts.entity';

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

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isUsed && !this.isExpired();
  }
}
