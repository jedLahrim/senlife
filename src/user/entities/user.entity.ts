import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Child } from '../../child/entities/child.entity';
import { UserType } from '../enums/user-type.enum';
import { SocialLoginPlatform } from '../dto/social-login.dto';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;
  @Column({ nullable: true })
  lastName: string;

  @Column()
  type: UserType;
  @Column({ nullable: true })
  socialLoginPlatform?: SocialLoginPlatform;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Column({ default: null, type: 'text' })
  profilePicture?: string;

  @Column({ default: false })
  activated?: boolean;

  access: string;
  refresh: string;
  refreshExpireAt: Date;
  accessExpireAt: Date;

  @OneToMany(() => Child, (child) => child.user)
  children: Child[];
}
