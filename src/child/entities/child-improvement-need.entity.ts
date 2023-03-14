import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Child } from './child.entity';
import { ImprovementNeed } from '../../improvement-need/entities/improvement-need.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class ChildImprovementNeed extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  visibleForCarer: boolean;

  @ManyToOne(() => Child, (object) => object.childImprovementNeeds)
  child: Child;

  @Expose({ name: 'name' })
  get name(): string {
    return this.improvementNeed.name;
  }

  // @Transform(({ value }) => value.name)
  @Exclude()
  @ManyToOne(() => ImprovementNeed, (object) => object.childImprovementNeeds)
  improvementNeed: ImprovementNeed;
}
