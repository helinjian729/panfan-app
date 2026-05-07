import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { User } from '../../user/entities/user.entity';
import { GroupOrderItem } from './group-order-item.entity';

export enum MemberStatus {
  JOINED = 'JOINED',     // 已加入
  PAID = 'PAID',         // 已支付
  CANCELLED = 'CANCELLED', // 已退出
}

@Entity('group_members')
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  groupId: string;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  itemsAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  payAmount: number;

  @Column({
    type: 'enum',
    enum: MemberStatus,
    default: MemberStatus.JOINED,
  })
  status: MemberStatus;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => GroupOrderItem, (item) => item.member)
  orderItems: GroupOrderItem[];
}
