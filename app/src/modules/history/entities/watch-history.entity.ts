import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Movie } from '../../content/entities/movie.entity';
import { Episode } from '../../content/entities/episode.entity';

@Entity('WatchHistory')
export class WatchHistory {
  @PrimaryGeneratedColumn({ name: 'history_id' })
  historyId: number;

  @Column({ name: 'profile_id' })
  profileId: number;

  @Column({ name: 'movie_id', nullable: true })
  movieId: number | null;

  @Column({ name: 'episode_id', nullable: true })
  episodeId: number | null;

  @Column({ name: 'duration_watched', default: 1 })
  durationWatched: number;

  @Column({ type: 'time', name: 'resume_position', default: '00:00:00' })
  resumePosition: string;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @UpdateDateColumn({ name: 'last_watched_at' })
  lastWatchedAt: Date;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Episode)
  @JoinColumn({ name: 'episode_id' })
  episode: Episode;
}
