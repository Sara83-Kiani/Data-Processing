import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/accounts.entity';
import { ProfilePreference } from './profile-preference.entity';

@Entity({ name: 'Profile' })
export class Profile {
  @PrimaryGeneratedColumn({ name: 'profile_id', type: 'int' })
  profileId: number;

  @Column({ name: 'account_id', type: 'int' })
  accountId: number;

  @ManyToOne(() => Account, (a) => a.profiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'name', type: 'varchar', length: 60 })
  name: string;

  @Column({ name: 'age', type: 'int', default: 18 })
  age: number;

  @Column({ name: 'language', type: 'enum', enum: ['ENGLISH', 'DUTCH'], default: 'ENGLISH' })
  language: 'ENGLISH' | 'DUTCH';

  @OneToMany(() => ProfilePreference, (pp) => pp.profile)
  preferences: ProfilePreference[];
}
