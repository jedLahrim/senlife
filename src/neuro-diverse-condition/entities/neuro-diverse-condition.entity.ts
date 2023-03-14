import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChildNeuroDiverseCondition } from '../../child/entities/child-neuro-diverse-condition.entity';

@Entity()
export class NeuroDiverseCondition extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => ChildNeuroDiverseCondition,
    (object) => object.neuroDiverseCondition,
  )
  childNeuroDiverseConditions: ChildNeuroDiverseCondition[];
}
