import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ChildImprovementNeed } from './child-improvement-need.entity';
import { Expose } from 'class-transformer';
import { ChildNeuroDiverseCondition } from './child-neuro-diverse-condition.entity';
import { Gender } from '../../commons/enums/gender';

@Entity()
export class Child extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column()
  fullName?: string;

  @Column()
  birthdayDate?: Date;

  @Column()
  address?: string;

  @Column()
  gender?: Gender;

  @ManyToOne(() => User, (user) => user.children)
  user: User;

  @Expose({ name: 'improvementNeeds' })
  @OneToMany(() => ChildImprovementNeed, (object) => object.child)
  childImprovementNeeds: ChildImprovementNeed[];

  @Expose({ name: 'neuroDiverseConditions' })
  @OneToMany(() => ChildNeuroDiverseCondition, (object) => object.child)
  childNeuroDiverseConditions: ChildNeuroDiverseCondition[];
}
