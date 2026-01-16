import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Account } from '../../accounts/entities/accounts.entity';

/**
 * Profile Entity - Represents user profiles within an account
 * Each account can have up to 4 profiles
 */
@Entity('Profile')
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'profile_id' })
  public profileId: number;

  @Column({ name: 'account_id' })
  public accountId: number;

  @Column({ length: 60 })
  public name: string;

  @Column({ default: 'placeholder.jpeg' })
  public image: string;

  @Column({ default: 18 })
  public age: number;

  @Column({
    type: 'enum',
    enum: ['ENGLISH', 'DUTCH'],
    default: 'ENGLISH',
  })
  public language: string;

  // Relationships
  @ManyToOne(() => Account, (account) => account.profiles)
  @JoinColumn({ name: 'account_id' })
  public account: Account;


  /**
   * Check if profile is for a child (under 13)
   */
  public isChildProfile(): boolean {
    return this.age < 13;
  }

  /**
   * Get age-appropriate content filter
   */
  public getAgeFilter(): number {
    return this.age;
  }

  /**
   * Validate profile data
   */
  public validate(): boolean {
    return !!(this.name && this.accountId && this.age >= 0);
  }

  /**
   * Update profile information
   */
  public updateInfo(name?: string, age?: number, image?: string, language?: string): void {
    if (name) this.name = name;
    if (age !== undefined) this.age = age;
    if (image) this.image = image;
    if (language) this.language = language;
  }
}
