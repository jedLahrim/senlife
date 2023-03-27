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
import { NeuroDiverseConditionType } from '../enums/neuro-diverse-condition-type';

@Entity()
export class NeuroDiverseCondition extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: NeuroDiverseConditionType;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => ChildNeuroDiverseCondition,
    (object) => object.neuroDiverseCondition,
    { onDelete: 'CASCADE' },
  )
  childNeuroDiverseConditions: ChildNeuroDiverseCondition[];
}
