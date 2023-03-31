import {
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Child } from '../../child/entities/child.entity';
import { IsOptional } from 'class-validator';

@Entity()
export class Allergie {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string;
  @ManyToOne(() => Child, (child) => child.allergie)
  child: Child;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
}
