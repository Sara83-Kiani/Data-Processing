import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Subscription' })
export class Subscription {
  @PrimaryGeneratedColumn({ name: 'subscription_id', type: 'int' })
  subscriptionId: number;

  @Column({ name: 'description', type: 'varchar', length: 255 })
  description: string;

  @Column({ name: 'price', type: 'double', default: 7.99 })
  price: number;

  @Column({ name: 'quality', type: 'enum', enum: ['SD', 'HD', 'UHD'], default: 'SD' })
  quality: 'SD' | 'HD' | 'UHD';

  @Column({ name: 'is_trial', type: 'boolean', default: false })
  isTrial: boolean;

  @Column({ name: 'trial_start_date', type: 'datetime', nullable: true })
  trialStartDate: Date | null;

  @Column({ name: 'trial_end_date', type: 'datetime', nullable: true })
  trialEndDate: Date | null;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  discountAmount: string; // TypeORM maps DECIMAL to string

  @Column({ name: 'discount_valid_until', type: 'datetime', nullable: true })
  discountValidUntil: Date | null;

  @Column({ name: 'start_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime', nullable: true })
  endDate: Date | null;

  @Column({ name: 'status', type: 'enum', enum: ['ACTIVE', 'CANCELLED', 'EXPIRED'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
}
