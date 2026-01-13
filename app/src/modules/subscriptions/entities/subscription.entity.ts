import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Subscription Entity - Represents subscription plans
 * Supports SD, HD, and UHD quality tiers with trial periods
 */
@Entity('Subscription')
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'subscription_id' })
  public subscriptionId: number;

  @Column()
  public description: string;

  @Column({ type: 'double', default: 7.99 })
  public price: number;

  @Column({
    type: 'enum',
    enum: ['SD', 'HD', 'UHD'],
    default: 'SD',
  })
  public quality: string;

  @Column({ name: 'is_trial', default: false })
  public isTrial: boolean;

  @Column({ name: 'trial_start_date', nullable: true })
  public trialStartDate: Date;

  @Column({ name: 'trial_end_date', nullable: true })
  public trialEndDate: Date;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 5, scale: 2, default: 0 })
  public discountAmount: number;

  @Column({ name: 'discount_valid_until', nullable: true })
  public discountValidUntil: Date;

  @CreateDateColumn({ name: 'start_date' })
  public startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  public endDate: Date;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'CANCELLED', 'EXPIRED'],
    default: 'ACTIVE',
  })
  public status: string;

  /**
   * Check if subscription is currently active
   */
  public isActive(): boolean {
    return this.status === 'ACTIVE' && (!this.endDate || new Date() < this.endDate);
  }

  /**
   * Check if trial period is active
   */
  public isTrialActive(): boolean {
    if (!this.isTrial || !this.trialEndDate) return false;
    return new Date() < this.trialEndDate;
  }

  /**
   * Check if discount is valid
   */
  public hasValidDiscount(): boolean {
    if (!this.discountValidUntil || this.discountAmount <= 0) return false;
    return new Date() < this.discountValidUntil;
  }

  /**
   * Calculate final price with discount
   */
  public getFinalPrice(): number {
    if (this.hasValidDiscount()) {
      return Math.max(0, this.price - this.discountAmount);
    }
    return this.price;
  }

  /**
   * Start trial period (7 days)
   */
  public startTrial(): void {
    this.isTrial = true;
    this.trialStartDate = new Date();
    this.trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  /**
   * Apply referral discount
   */
  public applyDiscount(amount: number, validityDays: number = 30): void {
    this.discountAmount = amount;
    this.discountValidUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
  }

  /**
   * Cancel subscription
   */
  public cancel(): void {
    this.status = 'CANCELLED';
    this.endDate = new Date();
  }

  /**
   * Validate subscription data
   */
  public validate(): boolean {
    return !!(this.description && this.price >= 0 && this.quality);
  }
}
