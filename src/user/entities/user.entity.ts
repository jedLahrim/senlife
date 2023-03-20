import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Child } from '../../child/entities/child.entity';
import { UserType } from '../enums/user-type.enum';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;
  @Column()
  lastName: string;

  @Column()
  type: UserType;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Column({ default: null, type: 'text' })
  profilePicture?: string;

  @Column({ default: false })
  @Exclude()
  activated?: boolean;

  access: string;
  refresh: string;
  refreshExpireAt: Date;
  accessExpireAt: Date;

  @OneToMany(() => Child, (child) => child.user)
  children: Child[];
}
