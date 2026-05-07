import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Group, GroupStatus } from './entities/group.entity';
import { GroupMember, MemberStatus } from './entities/group-member.entity';
import { GroupOrderItem } from './entities/group-order-item.entity';
import { RestaurantService } from '../restaurant/restaurant.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private memberRepository: Repository<GroupMember>,
    @InjectRepository(GroupOrderItem)
    private orderItemRepository: Repository<GroupOrderItem>,
    private restaurantService: RestaurantService,
    private dataSource: DataSource,
  ) {}

  // 生成6位邀请码
  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // 发起拼饭团
  async create(userId: string, dto: any): Promise<Group> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 验证商家存在
      const restaurant = await this.restaurantService.findById(dto.restaurantId);
      if (!restaurant) {
        throw new NotFoundException('商家不存在');
      }

      // 创建拼饭团
      const group = queryRunner.manager.create(Group, {
        name: dto.name,
        creatorId: userId,
        restaurantId: dto.restaurantId,
        targetCount: dto.targetCount || 5,
        deadline: new Date(Date.now() + (dto.expireMinutes || 30) * 60 * 1000),
        inviteCode: this.generateInviteCode(),
      });
      await queryRunner.manager.save(group);

      // 创建发起人为第一个成员
      const member = queryRunner.manager.create(GroupMember, {
        groupId: group.id,
        userId: userId,
        status: MemberStatus.JOINED,
      });
      await queryRunner.manager.save(member);

      await queryRunner.commitTransaction();

      return this.findById(group.id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 加入拼饭团
  async join(userId: string, inviteCode: string): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!group) {
      throw new NotFoundException('拼饭团不存在');
    }

    if (group.status !== GroupStatus.PENDING) {
      throw new BadRequestException('拼饭团已结束或已取消');
    }

    if (new Date() > group.deadline) {
      throw new BadRequestException('拼饭团已过期');
    }

    // 检查是否已是成员
    const existingMember = await this.memberRepository.findOne({
      where: { groupId: group.id, userId },
    });

    if (existingMember) {
      throw new BadRequestException('您已在该拼饭团中');
    }

    // 检查人数是否已满
    if (group.currentCount >= group.targetCount) {
      throw new BadRequestException('拼饭团人数已满');
    }

    // 添加成员
    const member = this.memberRepository.create({
      groupId: group.id,
      userId,
      status: MemberStatus.JOINED,
    });
    await this.memberRepository.save(member);

    // 更新拼饭团当前人数
    group.currentCount = await this.memberRepository.count({
      where: { groupId: group.id, status: MemberStatus.JOINED },
    });
    await this.groupRepository.save(group);

    return this.findById(group.id, userId);
  }

  // 获取用户的拼饭团列表
  async findByUser(userId: string, type: 'created' | 'joined'): Promise<Group[]> {
    if (type === 'created') {
      return this.groupRepository.find({
        where: { creatorId: userId },
        relations: ['restaurant', 'members', 'members.user'],
        order: { createdAt: 'DESC' },
      });
    } else {
      const memberships = await this.memberRepository.find({
        where: { userId, status: MemberStatus.JOINED },
        relations: ['group', 'group.restaurant', 'group.members', 'group.members.user'],
      });
      return memberships.map((m) => m.group);
    }
  }

  // 获取附近可加入的拼饭团
  async findNearby(): Promise<Group[]> {
    return this.groupRepository.find({
      where: {
        status: GroupStatus.PENDING,
      },
      relations: ['restaurant', 'creator', 'members'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  // 获取拼饭团详情
  async findById(id: string, userId?: string): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['restaurant', 'creator', 'members', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException('拼饭团不存在');
    }

    // 获取菜品详情
    const items = await this.orderItemRepository.find({
      where: { groupId: id },
      relations: ['member', 'menuItem'],
    });

    // 计算凑单
    const discount = this.calculateDiscount(group, items);

    return {
      ...group,
      items,
      discount,
      isCreator: group.creatorId === userId,
      currentMember: userId
        ? group.members.find((m) => m.userId === userId)
        : null,
    };
  }

  // 取消拼饭团（仅发起人）
  async cancel(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });

    if (!group) {
      throw new NotFoundException('拼饭团不存在');
    }

    if (group.creatorId !== userId) {
      throw new BadRequestException('只有发起人可以取消拼饭团');
    }

    group.status = GroupStatus.CANCELLED;
    await this.groupRepository.save(group);

    return group;
  }

  // 退出拼饭团（成员）
  async leave(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });

    if (!group) {
      throw new NotFoundException('拼饭团不存在');
    }

    if (group.creatorId === userId) {
      throw new BadRequestException('发起人不能退出，请取消拼饭团');
    }

    const member = await this.memberRepository.findOne({
      where: { groupId, userId },
    });

    if (!member) {
      throw new NotFoundException('您不在该拼饭团中');
    }

    member.status = MemberStatus.CANCELLED;
    await this.memberRepository.save(member);

    // 更新拼饭团人数
    group.currentCount = await this.memberRepository.count({
      where: { groupId, status: MemberStatus.JOINED },
    });
    await this.groupRepository.save(group);

    return this.findById(groupId, userId);
  }

  // 获取拼饭团菜品清单
  async getGroupItems(groupId: string): Promise<GroupOrderItem[]> {
    return this.orderItemRepository.find({
      where: { groupId },
      relations: ['member', 'member.user', 'menuItem'],
      order: { createdAt: 'ASC' },
    });
  }

  // 添加菜品到拼饭团
  async addItem(groupId: string, userId: string, dto: any): Promise<GroupOrderItem> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });

    if (!group) {
      throw new NotFoundException('拼饭团不存在');
    }

    if (group.status !== GroupStatus.PENDING) {
      throw new BadRequestException('拼饭团已结束');
    }

    // 获取成员的member记录
    const member = await this.memberRepository.findOne({
      where: { groupId, userId, status: MemberStatus.JOINED },
    });

    if (!member) {
      throw new BadRequestException('您不在该拼饭团中');
    }

    // 获取菜品信息
    const menuItem = await this.restaurantService.findMenuByRestaurantId(
      group.restaurantId,
    );
    const item = menuItem.find((i) => i.id === dto.menuItemId);

    if (!item) {
      throw new NotFoundException('菜品不存在');
    }

    // 创建订单项
    const orderItem = this.orderItemRepository.create({
      groupId,
      memberId: member.id,
      menuItemId: dto.menuItemId,
      name: item.name,
      price: item.price,
      quantity: dto.quantity || 1,
      remark: dto.remark,
    });

    await this.orderItemRepository.save(orderItem);

    // 更新成员金额
    member.itemsAmount = await this.calculateMemberAmount(member.id);
    await this.memberRepository.save(member);

    // 更新拼饭团总金额
    await this.updateGroupAmount(groupId);

    return orderItem;
  }

  // 删除拼饭团菜品
  async removeItem(groupId: string, itemId: string, userId: string): Promise<void> {
    const item = await this.orderItemRepository.findOne({
      where: { id: itemId },
      relations: ['member'],
    });

    if (!item) {
      throw new NotFoundException('菜品不存在');
    }

    if (item.member.userId !== userId) {
      throw new BadRequestException('只能删除自己的菜品');
    }

    await this.orderItemRepository.delete(itemId);

    // 更新成员金额
    const member = await this.memberRepository.findOne({
      where: { id: item.memberId },
    });
    member.itemsAmount = await this.calculateMemberAmount(member.id);
    await this.memberRepository.save(member);

    // 更新拼饭团总金额
    await this.updateGroupAmount(groupId);
  }

  // 计算成员菜品金额
  private async calculateMemberAmount(memberId: string): Promise<number> {
    const items = await this.orderItemRepository.find({
      where: { memberId },
    });
    return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }

  // 更新拼饭团总金额
  private async updateGroupAmount(groupId: string): Promise<void> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    const members = await this.memberRepository.find({
      where: { groupId, status: MemberStatus.JOINED },
    });

    const totalAmount = members.reduce((sum, m) => sum + Number(m.itemsAmount), 0);
    const discount = this.calculateDiscountAmount(totalAmount, group.restaurantId);

    group.totalAmount = totalAmount;
    group.discountAmount = discount;
    group.finalAmount = totalAmount - discount;

    await this.groupRepository.save(group);
  }

  // 计算凑单进度
  async getDiscountCalculation(groupId: string): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['restaurant'],
    });

    const items = await this.orderItemRepository.find({
      where: { groupId },
    });

    return this.calculateDiscount(group, items);
  }

  private calculateDiscount(group: Group, items: GroupOrderItem[]): any {
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    const discountInfo = group.restaurant?.discountInfo || {};
    const thresholds = Object.keys(discountInfo)
      .map((k) => ({
        name: k,
        threshold: discountInfo[k].threshold,
        discount: discountInfo[k].discount,
      }))
      .sort((a, b) => a.threshold - b.threshold);

    let currentDiscount = 0;
    let nextThreshold = null;

    for (const t of thresholds) {
      if (totalAmount >= t.threshold) {
        currentDiscount = t.discount;
      } else {
        nextThreshold = t;
        break;
      }
    }

    return {
      totalAmount,
      currentDiscount,
      finalAmount: totalAmount - currentDiscount,
      nextThreshold,
      thresholds,
      isSatisfied: nextThreshold === null,
    };
  }

  private calculateDiscountAmount(totalAmount: number, restaurantId: string): number {
    // 这里需要获取restaurant的discountInfo
    // 简化实现
    if (totalAmount >= 200) return 50;
    if (totalAmount >= 150) return 40;
    if (totalAmount >= 120) return 35;
    if (totalAmount >= 100) return 30;
    if (totalAmount >= 80) return 20;
    if (totalAmount >= 50) return 10;
    return 0;
  }

  // 定时任务：检查过期的拼饭团
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredGroups(): Promise<void> {
    const expiredGroups = await this.groupRepository.find({
      where: {
        status: GroupStatus.PENDING,
        deadline: new Date(),
      },
    });

    for (const group of expiredGroups) {
      // 检查是否满足成团条件（当前人数 > 1）
      if (group.currentCount > 0) {
        group.status = GroupStatus.SUCCESS;
      } else {
        group.status = GroupStatus.FAILED;
      }
      await this.groupRepository.save(group);
      console.log(`拼饭团 ${group.id} 已${group.status === GroupStatus.SUCCESS ? '成团' : '失败'}`);
    }
  }
}
