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
import { Group } from '../../group/entities/group.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',       // 待支付
  PAID = 'PAID',             // 已支付
  ACCEPTED = 'ACCEPTED',     // 已接单
  DELIVERING = 'DELIVERING', // 配送中
  DELIVERED = 'DELIVERED',   // 已送达
  COMPLETED = 'COMPLETED',   // 已完成
  REFUNDED = 'REFUNDED',     // 已退款
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  groupId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  orderNo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'timestamp', nullable: true })
  payTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveryTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Group, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
