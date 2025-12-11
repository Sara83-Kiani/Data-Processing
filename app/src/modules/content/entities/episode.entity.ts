import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Series } from './series.entity';

/**
 * Episode Entity - Represents individual episodes within a series
 * Contains episode-specific metadata
 */
@Entity('Episode')
export class Episode extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'episode_id' })
  public episodeId: number;

  @Column({ name: 'series_id' })
  public seriesId: number;

  @Column()
  public title: string;

  @Column({ type: 'time', default: '00:00:00' })
  public duration: string;

  @Column({ name: 'season_number' })
  public seasonNumber: number;

  @Column({ name: 'episode_number' })
  public episodeNumber: number;

  // Relationships
  @ManyToOne(() => Series, (series) => series.episodes)
  @JoinColumn({ name: 'series_id' })
  public series: Series;

  /**
   * Get duration in minutes
   */
  public getDurationInMinutes(): number {
    if (!this.duration) return 0;
    const [hours, minutes] = this.duration.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get formatted episode identifier (e.g., "S01E05")
   */
  public getEpisodeCode(): string {
    const season = String(this.seasonNumber).padStart(2, '0');
    const episode = String(this.episodeNumber).padStart(2, '0');
    return `S${season}E${episode}`;
  }

  /**
   * Get full episode title with code
   */
  public getFullTitle(): string {
    return `${this.getEpisodeCode()} - ${this.title}`;
  }

  /**
   * Get formatted duration string
   */
  public getFormattedDuration(): string {
    const totalMinutes = this.getDurationInMinutes();
    return `${totalMinutes}m`;
  }

  /**
   * Check if this is the first episode of the series
   */
  public isFirstEpisode(): boolean {
    return this.seasonNumber === 1 && this.episodeNumber === 1;
  }

  /**
   * Validate episode data
   */
  public validate(): boolean {
    return !!(
      this.title &&
      this.duration &&
      this.seriesId &&
      this.seasonNumber > 0 &&
      this.episodeNumber > 0
    );
  }
}
