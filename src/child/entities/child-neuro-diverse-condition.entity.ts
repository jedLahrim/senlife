import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Child } from './child.entity';
import { NeuroDiverseCondition } from '../../neuro-diverse-condition/entities/neuro-diverse-condition.entity';
import { Expose, Transform } from 'class-transformer';

@Entity()
export class ChildNeuroDiverseCondition extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Child, (object) => object.childImprovementNeeds)
  child: Child;

  @Expose({ name: 'name' })
  @Transform(({ value }) => value.name)
  @ManyToOne(
    () => NeuroDiverseCondition,
    (object) => object.childNeuroDiverseConditions,
  )
  neuroDiverseCondition: NeuroDiverseCondition;
}
