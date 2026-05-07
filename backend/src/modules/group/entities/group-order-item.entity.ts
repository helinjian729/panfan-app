import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { GroupMember } from './group-member.entity';
import { MenuItem } from '../../restaurant/entities/menu-item.entity';

@Entity('group_order_items')
export class GroupOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  groupId: string;

  @Column()
  memberId: string;

  @Column({ nullable: true })
  menuItemId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @ManyToOne(() => GroupMember, (member) => member.orderItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'memberId' })
  member: GroupMember;

  @ManyToOne(() => MenuItem, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuItem;
}
