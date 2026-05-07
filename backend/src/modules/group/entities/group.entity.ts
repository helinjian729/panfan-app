import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Restaurant } from '../../restaurant/entities/restaurant.entity';
import { GroupMember } from './group-member.entity';
import { GroupOrderItem } from './group-order-item.entity';

export enum GroupStatus {
  PENDING = 'PENDING',     // 待成团
  SUCCESS = 'SUCCESS',     // 已成团
  FAILED = 'FAILED',      // 成团失败
  CANCELLED = 'CANCELLED', // 已取消
}

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column()
  creatorId: string;

  @Column()
  restaurantId: string;

  @Column({ default: 5 })
  targetCount: number;  // 目标人数（不含发起人）

  @Column({ default: 0 })
  currentCount: number;  // 当前已加入人数

  @Column({
    type: 'enum',
    enum: GroupStatus,
    default: GroupStatus.PENDING,
  })
  status: GroupStatus;

  @Column()
  deadline: Date;

  @Column({ type: 'varchar', length: 10, unique: true })
  inviteCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  finalAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => Restaurant, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @OneToMany(() => GroupOrderItem, (item) => item.group)
  orderItems: GroupOrderItem[];
}
