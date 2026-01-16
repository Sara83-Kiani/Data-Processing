import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from '../../accounts/entities/accounts.entity';

@Entity({ name: 'Invitation' })
export class Invitation {
  @PrimaryGeneratedColumn({ name: 'invitation_id', type: 'int' })
  invitationId: number;

  @Column({ name: 'inviter_account_id', type: 'int' })
  inviterAccountId: number;

  @ManyToOne(() => Account, (a) => a.invitationsSent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inviter_account_id' })
  inviter: Account;

  @Column({ name: 'invitee_email', type: 'varchar', length: 50 })
  inviteeEmail: string;

  @Column({ name: 'invitee_account_id', type: 'int', nullable: true })
  inviteeAccountId: number | null;

  @Column({ name: 'invitation_code', type: 'varchar', length: 50, unique: true })
  invitationCode: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
  acceptedAt: Date | null;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  discountAmount: string; // TypeORM maps DECIMAL to string

  @Column({ name: 'discount_started_at', type: 'datetime', nullable: true })
  discountStartedAt: Date | null;

  @Column({ name: 'discount_valid_until', type: 'datetime', nullable: true })
  discountValidUntil: Date | null;

  @Column({ name: 'discount_applied', type: 'boolean', default: false })
  discountApplied: boolean;

  @Column({ name: 'status', type: 'enum', enum: ['PENDING', 'ACCEPTED', 'EXPIRED'], default: 'PENDING' })
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
}
