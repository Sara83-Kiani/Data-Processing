import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Genre } from './genre.entity';
import { Classification } from './classification.entity';

/**
 * Movie Entity - Represents individual movies
 * Contains metadata and relationships to genre and classification
 */
@Entity('Movie')
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'movie_id' })
  public movieId: number;

  @Column()
  public title: string;

  @Column()
  public description: string;

  @Column({ type: 'time', default: '00:00:00' })
  public duration: string;

  @Column({ name: 'genre_id' })
  public genreId: number;

  @Column({ name: 'classification_id' })
  public classificationId: number;

  // Relationships
  @ManyToOne(() => Genre)
  @JoinColumn({ name: 'genre_id' })
  public genre: Genre;

  @ManyToOne(() => Classification)
  @JoinColumn({ name: 'classification_id' })
  public classification: Classification;

  /**
   * Get duration in minutes
   */
  public getDurationInMinutes(): number {
    if (!this.duration) return 0;
    const [hours, minutes] = this.duration.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check if movie is appropriate for given age
   */
  public isAppropriateForAge(age: number): boolean {
    if (!this.classification) return true;
    return this.classification.isAppropriateForAge(age);
  }

  /**
   * Get formatted duration string (e.g., "2h 30m")
   */
  public getFormattedDuration(): string {
    const totalMinutes = this.getDurationInMinutes();
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Validate movie data
   */
  public validate(): boolean {
    return !!(
      this.title &&
      this.description &&
      this.duration &&
      this.genreId &&
      this.classificationId
    );
  }
}
