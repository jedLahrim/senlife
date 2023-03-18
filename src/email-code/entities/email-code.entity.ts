import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class EmailCode extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  code: string;
  @Column()
  email: string;
  @Column()
  expireAt: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
