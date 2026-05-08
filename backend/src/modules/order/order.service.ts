import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { GroupService } from '../group/group.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private groupService: GroupService,
    private dataSource: DataSource,
  ) {}

  private generateOrderNo(): string {
    return `PF${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  async create(userId: string, dto: any): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let order: Order;

      if (dto.groupId) {
        const groupDetails = await this.groupService.findById(dto.groupId, userId);
        if (!groupDetails) {
          throw new NotFoundException('拼饭团不存在');
        }

        order = queryRunner.manager.create(Order, {
          groupId: dto.groupId,
          orderNo: this.generateOrderNo(),
          totalAmount: groupDetails.totalAmount,
          discountAmount: groupDetails.discount.currentDiscount,
          finalAmount: groupDetails.discount.finalAmount,
          status: OrderStatus.PENDING,
        });
        await queryRunner.manager.save(order);

        for (const item of groupDetails.items) {
          const orderItem = queryRunner.manager.create(OrderItem, {
            orderId: order.id,
            userId: item.member.userId,
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            remark: item.remark,
          });
          await queryRunner.manager.save(orderItem);
        }
      } else {
        throw new BadRequestException('缺少groupId参数');
      }

      await queryRunner.commitTransaction();
      return this.findById(order.id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByUser(userId: string): Promise<Order[]> {
    // Find orders where user is creator or has items
    const createdOrders = await this.orderRepository.find({
      where: {},
      relations: ['items', 'group'],
    });

    return createdOrders.filter(
      (order) => order.items.some((item) => item.userId === userId) || order.group?.creatorId === userId,
    );
  }

  async findById(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.user', 'group', 'group.restaurant'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    const userItems = order.items.filter((item) => item.userId === userId);
    const userTotal = userItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const userShare = order.finalAmount * (userTotal / Number(order.totalAmount));

    return {
      ...order,
      userItems,
      userShare,
    } as any;
  }

  async pay(orderId: string, userId: string, dto: any): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('订单状态不允许支付');
    }

    order.status = OrderStatus.PAID;
    order.payTime = new Date();
    await this.orderRepository.save(order);

    return order;
  }

  async cancel(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('订单状态不允许取消');
    }

    order.status = OrderStatus.REFUNDED;
    await this.orderRepository.save(order);

    return order;
  }
}
