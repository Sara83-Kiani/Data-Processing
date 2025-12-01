import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderAccountId: number;

  @Column()
  receiverEmail: string;

  @Column()
  status: string; // pending / accepted
}
