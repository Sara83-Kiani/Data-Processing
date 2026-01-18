import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'Account' })
export class Account {
  @PrimaryGeneratedColumn({ name: 'account_id', type: 'int' })
  id: number;

  @Index({ unique: true })
  @Column({ name: 'email', type: 'varchar', length: 50 })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 60 })
  password: string;

  @Column({ name: 'is_activated', type: 'boolean', default: false })
  isActivated: boolean;

  @CreateDateColumn({ name: 'registration_date', type: 'timestamp' })
  registrationDate: Date;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'datetime', nullable: true })
  lockedUntil: Date | null;

  // account has more columns (subscription_id, payment_method, etc.)
  // add them later if needed
}
