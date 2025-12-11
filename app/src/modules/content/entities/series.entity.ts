import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Genre } from './genre.entity';
import { Classification } from './classification.entity';
import { Episode } from './episode.entity';

/**
 * Series Entity - Represents TV series
 * Contains metadata and relationships to episodes
 */
@Entity('Series')
export class Series extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'series_id' })
  public seriesId: number;

  @Column()
  public title: string;

  @Column()
  public description: string;

  @Column({ default: 1 })
  public seasons: number;

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

  @OneToMany(() => Episode, (episode) => episode.series)
  public episodes: Episode[];

  /**
   * Check if series is appropriate for given age
   */
  public isAppropriateForAge(age: number): boolean {
    if (!this.classification) return true;
    return this.classification.isAppropriateForAge(age);
  }

  /**
   * Get total number of episodes
   */
  public getTotalEpisodes(): number {
    return this.episodes ? this.episodes.length : 0;
  }

  /**
   * Get episodes for specific season
   */
  public getEpisodesBySeason(seasonNumber: number): Episode[] {
    if (!this.episodes) return [];
    return this.episodes.filter((ep) => ep.seasonNumber === seasonNumber);
  }

  /**
   * Validate series data
   */
  public validate(): boolean {
    return !!(
      this.title &&
      this.description &&
      this.seasons > 0 &&
      this.genreId &&
      this.classificationId
    );
  }
}
