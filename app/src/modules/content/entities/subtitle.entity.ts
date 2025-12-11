import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Movie } from './movie.entity';
import { Episode } from './episode.entity';

/**
 * Subtitle Entity - Represents subtitle files for movies and episodes
 * Supports multiple languages
 */
@Entity('Subtitle')
export class Subtitle extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'subtitle_id' })
  public subtitleId: number;

  @Column({ name: 'movie_id', nullable: true })
  public movieId: number;

  @Column({ name: 'episode_id', nullable: true })
  public episodeId: number;

  @Column({
    type: 'enum',
    enum: ['ENGLISH', 'DUTCH'],
    default: 'ENGLISH',
  })
  public language: string;

  @Column({ name: 'subtitle_location' })
  public subtitleLocation: string;

  // Relationships
  @ManyToOne(() => Movie, { nullable: true })
  @JoinColumn({ name: 'movie_id' })
  public movie: Movie;

  @ManyToOne(() => Episode, { nullable: true })
  @JoinColumn({ name: 'episode_id' })
  public episode: Episode;

  /**
   * Check if subtitle is for a movie
   */
  public isForMovie(): boolean {
    return !!this.movieId && !this.episodeId;
  }

  /**
   * Check if subtitle is for an episode
   */
  public isForEpisode(): boolean {
    return !!this.episodeId && !this.movieId;
  }

  /**
   * Get subtitle file extension
   */
  public getFileExtension(): string {
    const parts = this.subtitleLocation.split('.');
    return parts[parts.length - 1];
  }

  /**
   * Validate subtitle data
   */
  public validate(): boolean {
    // Must have either movieId or episodeId, but not both
    const hasValidContent = 
      (this.movieId && !this.episodeId) || 
      (!this.movieId && this.episodeId);
    
    return !!(hasValidContent && this.language && this.subtitleLocation);
  }
}
