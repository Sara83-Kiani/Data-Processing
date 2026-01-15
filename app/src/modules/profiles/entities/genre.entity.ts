import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Genre' })
export class Genre {
  @PrimaryGeneratedColumn({ name: 'genre_id', type: 'int' })
  genreId: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;
}
