import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Genre Entity - Represents content genres
 * Used for categorizing movies and series
 */
@Entity('Genre')
export class Genre extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'genre_id' })
  public genreId: number;

  @Column({ unique: true })
  public name: string;

  /**
   * Validate genre data
   */
  public validate(): boolean {
    return !!(this.name && this.name.length > 0);
  }

  /**
   * Get genre display name
   */
  public getDisplayName(): string {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  }
}
