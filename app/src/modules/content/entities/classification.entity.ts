import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Classification Entity - Represents age ratings and content classifications
 * Used for age-appropriate content filtering
 */
@Entity('Classification')
export class Classification extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'classification_id' })
  public classificationId: number;

  @Column()
  public name: string;

  @Column()
  public description: string;

  /**
   * Get minimum age for this classification
   * Maps classification names to age requirements
   */
  public getMinimumAge(): number {
    const ageMap: Record<string, number> = {
      'G': 0,
      'PG': 8,
      'PG-13': 13,
      'R': 17,
      'NC-17': 18,
      'TV-Y': 0,
      'TV-Y7': 7,
      'TV-G': 0,
      'TV-PG': 8,
      'TV-14': 14,
      'TV-MA': 18,
    };
    return ageMap[this.name] || 0;
  }

  /**
   * Check if classification is appropriate for given age
   */
  public isAppropriateForAge(age: number): boolean {
    return age >= this.getMinimumAge();
  }

  /**
   * Validate classification data
   */
  public validate(): boolean {
    return !!(this.name && this.description);
  }
}
