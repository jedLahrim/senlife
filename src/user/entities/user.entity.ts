import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MyCode } from '../../code/entities/code.entity';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Child } from '../../child/entities/child.entity';

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

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Column()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  @Exclude()
  password: string;

  @Column({ default: null })
  profilePicture?: string;

  @Column({ default: false })
  @Exclude()
  activated?: boolean;

  @OneToMany((_type) => MyCode, (code) => code.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  code: MyCode[];

  access: string;
  refresh: string;
  refreshExpireAt: Date;
  accessExpireAt: Date;

  @OneToMany(() => Child, (child) => child.user)
  children: Child[];
}
