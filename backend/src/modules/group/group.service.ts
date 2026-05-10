import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Group, GroupStatus } from './entities/group.entity';
import { GroupMember, MemberStatus } from './entities/group-member.entity';
import { GroupOrderItem } from './entities/group-order-item.entity';
import { RestaurantService } from '../restaurant/restaurant.service';

const DEFAULT_TARGET_COUNT = 5;
const DEFAULT_EXPIRE_MINUTES = 30;

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

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async create(userId: string, dto: any): Promise<Group> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const restaurant = await this.restaurantService.findById(dto.restaurantId);
      if (!restaurant) {
        throw new NotFoundException('商家不存在');
      }

      const group = queryRunner.manager.create(Group, {
        name: dto.name,
        creatorId: userId,
        restaurantId: dto.restaurantId,
        targetCount: dto.maxMembers || dto.targetCount || DEFAULT_TARGET_COUNT,
        deadline: dto.deadline ? new Date(dto.deadline) : new Date(Date.now() + (dto.expireMinutes || DEFAULT_EXPIRE_MINUTES) * 60 * 1000),
        inviteCode: this.generateInviteCode(),
      });
      await queryRunner.manager.save(group);

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

    const existingMember = await this.memberRepository.findOne({
      where: { groupId: group.id, userId },
    });

    if (existingMember) {
      throw new BadRequestException('您已在该拼饭团中');
    }

    if (group.currentCount >= group.targetCount) {
      throw new BadRequestException('拼饭团人数已满');
    }

    const member = this.memberRepository.create({
      groupId: group.id,
      userId,
      status: MemberStatus.JOINED,
    });
    await this.memberRepository.save(member);

    // Increment directly instead of recounting
    group.currentCount += 1;
    await this.groupRepository.save(group);

    return this.findById(group.id, userId);
  }

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

  async findNearby(): Promise<Group[]> {
    return this.groupRepository.find({
      where: { status: GroupStatus.PENDING },
      relations: ['restaurant', 'creator', 'members'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async findById(id: string, userId?: string): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['restaurant', 'creator', 'members', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException('拼饭团不存在');
    }

    const items = await this.orderItemRepository.find({
      where: { groupId: id },
      relations: ['member', 'menuItem'],
    });

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

    // Decrement directly instead of recounting
    group.currentCount = Math.max(0, group.currentCount - 1);
    await this.groupRepository.save(group);

    return this.findById(groupId, userId);
  }

  async getGroupItems(groupId: string): Promise<GroupOrderItem[]> {
    return this.orderItemRepository.find({
      where: { groupId },
      relations: ['member', 'member.user', 'menuItem'],
      order: { createdAt: 'ASC' },
    });
  }

  async addItem(groupId: string, userId: string, dto: any): Promise<GroupOrderItem> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });

    if (!group) {
      throw new NotFoundException('拼饭团不存在');
    }

    if (group.status !== GroupStatus.PENDING) {
      throw new BadRequestException('拼饭团已结束');
    }

    const member = await this.memberRepository.findOne({
      where: { groupId, userId, status: MemberStatus.JOINED },
    });

    if (!member) {
      throw new BadRequestException('您不在该拼饭团中');
    }

    const menuItem = await this.restaurantService.findMenuByRestaurantId(group.restaurantId);
    const item = menuItem.find((i) => i.id === dto.menuItemId);

    if (!item) {
      throw new NotFoundException('菜品不存在');
    }

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

    member.itemsAmount = await this.calculateMemberAmount(member.id);
    await this.memberRepository.save(member);

    await this.updateGroupAmount(groupId);

    return orderItem;
  }

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

    const member = await this.memberRepository.findOne({
      where: { id: item.memberId },
    });
    member.itemsAmount = await this.calculateMemberAmount(member.id);
    await this.memberRepository.save(member);

    await this.updateGroupAmount(groupId);
  }

  private async calculateMemberAmount(memberId: string): Promise<number> {
    const items = await this.orderItemRepository.find({ where: { memberId } });
    return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }

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

  async getDiscountCalculation(groupId: string): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['restaurant'],
    });

    const items = await this.orderItemRepository.find({ where: { groupId } });

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
    // Returns 0 if totalAmount < 50, otherwise returns the highest applicable discount
    // Thresholds are: 50->10, 80->20, 100->30, 120->35, 150->40, 200->50
    const thresholds = [
      { min: 50, discount: 10 },
      { min: 80, discount: 20 },
      { min: 100, discount: 30 },
      { min: 120, discount: 35 },
      { min: 150, discount: 40 },
      { min: 200, discount: 50 },
    ];

    let applicableDiscount = 0;
    for (const t of thresholds) {
      if (totalAmount >= t.min) {
        applicableDiscount = t.discount;
      }
    }
    return applicableDiscount;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredGroups(): Promise<void> {
    const expiredGroups = await this.groupRepository.find({
      where: {
        status: GroupStatus.PENDING,
        deadline: LessThan(new Date()),
      },
    });

    for (const group of expiredGroups) {
      group.status = group.currentCount > 0 ? GroupStatus.SUCCESS : GroupStatus.FAILED;
      await this.groupRepository.save(group);
      console.log(`拼饭团 ${group.id} 已${group.status === GroupStatus.SUCCESS ? '成团' : '失败'}`);
    }
  }
}
