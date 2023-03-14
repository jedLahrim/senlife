import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Child } from './child.entity';
import { ImprovementNeed } from '../../improvement-need/entities/improvement-need.entity';

@Entity()
export class ChildImprovementNeed extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  selected: boolean;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Child, (object) => object.childImprovementNeeds)
  child: Child;

  @ManyToOne(() => ImprovementNeed, (object) => object.childImprovementNeeds)
  improvementNeed: ImprovementNeed;
}
