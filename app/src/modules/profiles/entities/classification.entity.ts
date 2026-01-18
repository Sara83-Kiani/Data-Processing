import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Classification' })
export class Classification {
  @PrimaryGeneratedColumn({ name: 'classification_id', type: 'int' })
  classificationId: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 255 })
  description: string;
}
