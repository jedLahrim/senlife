import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ChildImprovementNeed } from './child-improvement-need.entity';
import { Expose } from 'class-transformer';
import { ChildNeuroDiverseCondition } from './child-neuro-diverse-condition.entity';
import { Gender } from '../../commons/enums/gender';
import { Medication } from '../../medication/entities/medication.entity';

@Entity()
export class Child extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column({ nullable: true })
  videoIntroUrl?: string;

  @Column()
  fullName?: string;

  @Column({ nullable: true })
  birthdayDate?: Date;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  gender?: Gender;

  @ManyToOne(() => User, (user) => user.children)
  user: User;

  @Expose({ name: 'improvementNeeds' })
  @OneToMany(() => ChildImprovementNeed, (object) => object.child, {
    onDelete: 'CASCADE',
  })
  childImprovementNeeds: ChildImprovementNeed[];

  @Expose({ name: 'neuroDiverseConditions' })
  @OneToMany(() => ChildNeuroDiverseCondition, (object) => object.child, {
    onDelete: 'CASCADE',
  })
  childNeuroDiverseConditions: ChildNeuroDiverseCondition[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Medication, (medication) => medication.child, {
    onDelete: 'CASCADE',
  })
  medication: Medication[];
}
