import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Movie } from '../../content/entities/movie.entity';
import { Series } from '../../content/entities/series.entity';
import { Episode } from '../../content/entities/episode.entity';

@Entity('Watchlist')
export class Watchlist {
  @PrimaryGeneratedColumn({ name: 'watchlist_id' })
  watchlistId: number;

  @Column({ name: 'profile_id' })
  profileId: number;

  @Column({ name: 'movie_id', nullable: true })
  movieId: number | null;

  @Column({ name: 'series_id', nullable: true })
  seriesId: number | null;

  @Column({ name: 'episode_id', nullable: true })
  episodeId: number | null;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Series)
  @JoinColumn({ name: 'series_id' })
  series: Series;

  @ManyToOne(() => Episode)
  @JoinColumn({ name: 'episode_id' })
  episode: Episode;
}
