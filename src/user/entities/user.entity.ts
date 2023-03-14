import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Exclude } from 'class-transformer';
import { MyCode } from '../../code/entities/code.entity';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Order } from '../../stripe/order.entity';
import { SharedEvent } from '../../event/entities/sharedEvent.entity';
import { StripeIntent } from '../../stripe/entities/stripe-intent.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  @Exclude()
  password: string;

  @Column({ default: null })
  profilePicture?: string;

  @Column({ default: false })
  @Exclude()
  activated?: boolean;

  @OneToMany((_type) => Event, (event) => event.user, {
    eager: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @Exclude({ toPlainOnly: true, toClassOnly: true })
  event: Event[];

  @OneToMany((_type) => MyCode, (code) => code.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  code: MyCode[];

  @OneToMany((_type) => Order, (order) => order.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  orders: Order[];

  @OneToMany((_type) => SharedEvent, (sharedEvent) => sharedEvent.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  sharedEvents: SharedEvent[];

  access: string;
  refresh: string;
  refreshExpireAt: Date;
  accessExpireAt: Date;

  @Column({ default: null })
  @IsOptional()
  @Exclude()
  customerId?: string;

  @OneToMany((_type) => StripeIntent, (stripeIntent) => stripeIntent.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  stripeIntents: StripeIntent[];
}
