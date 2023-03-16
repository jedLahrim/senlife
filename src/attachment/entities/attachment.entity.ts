import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Attachment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ default: null })
  name: string;
  @Column({ default: null })
  url: string;
}
