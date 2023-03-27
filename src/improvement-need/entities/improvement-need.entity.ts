import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChildImprovementNeed } from '../../child/entities/child-improvement-need.entity';

@Entity()
export class ImprovementNeed extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChildImprovementNeed, (object) => object.improvementNeed, {
    onDelete: 'CASCADE',
  })
  childImprovementNeeds: ChildImprovementNeed[];
}
