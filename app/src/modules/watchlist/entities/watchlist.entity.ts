import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { Movie } from '../../content/entities/movie.entity';
import { Series } from '../../content/entities/series.entity';
import { Episode } from '../../content/entities/episode.entity';

/**
 * Watchlist Entity - Represents items in a user's watchlist
 * Each profile can have their own watchlist of movies and series
 */
@Entity('Watchlist')
@Index('idx_watchlist_profile', ['profileId'])
@Index('unique_profile_movie', ['profileId', 'movieId'], { unique: true, where: 'movie_id IS NOT NULL' })
@Index('unique_profile_series', ['profileId', 'seriesId'], { unique: true, where: 'series_id IS NOT NULL' })
export class Watchlist extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'watchlist_id' })
  public watchlistId: number;

  @Column({ name: 'profile_id' })
  public profileId: number;

  @Column({ name: 'movie_id', nullable: true })
  public movieId: number | null;

  @Column({ name: 'series_id', nullable: true })
  public seriesId: number | null;

  @Column({ name: 'episode_id', nullable: true })
  public episodeId: number | null;

  @Column({ name: 'added_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public addedAt: Date;

  // Relationships
  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'profile_id' })
  public profile: Profile;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id' })
  public movie: Movie;

  @ManyToOne(() => Series)
  @JoinColumn({ name: 'series_id' })
  public series: Series;

  @ManyToOne(() => Episode)
  @JoinColumn({ name: 'episode_id' })
  public episode: Episode;

  /**
   * Check if this watchlist item is a movie
   */
  public isMovie(): boolean {
    return this.movieId !== null;
  }

  /**
   * Check if this watchlist item is a series
   */
  public isSeries(): boolean {
    return this.seriesId !== null;
  }

  /**
   * Get the title of the watchlist item
   */
  public getTitle(): string {
    if (this.movie) return this.movie.title;
    if (this.series) return this.series.title;
    return 'Unknown';
  }

  /**
   * Get content type string
   */
  public getContentType(): 'movie' | 'series' {
    return this.movieId ? 'movie' : 'series';
  }

  /**
   * Validate watchlist item data
   */
  public validate(): boolean {
    // Must have a profile
    if (!this.profileId) return false;
    
    // Must reference either a movie OR a series+episode
    if (this.movieId) {
      return true;
    }
    
    if (this.seriesId && this.episodeId) {
      return true;
    }
    
    return false;
  }
}
