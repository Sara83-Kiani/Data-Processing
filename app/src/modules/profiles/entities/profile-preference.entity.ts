import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Profile } from './profile.entity';
import { Genre } from './genre.entity';
import { Classification } from './classification.entity';

@Entity({ name: 'ProfilePreference' })
export class ProfilePreference {
  @PrimaryColumn({ name: 'profile_id', type: 'int' })
  profileId: number;

  @PrimaryColumn({ name: 'classification_id', type: 'int' })
  classificationId: number;

  @PrimaryColumn({ name: 'genre_id', type: 'int' })
  genreId: number;

  @ManyToOne(() => Profile, (p) => p.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Classification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classification_id' })
  classification: Classification;

  @ManyToOne(() => Genre, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'genre_id' })
  genre: Genre;
}
