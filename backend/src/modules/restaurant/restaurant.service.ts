import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menu-item.entity';

@Injectable()
export class RestaurantService implements OnModuleInit {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  // 应用启动时初始化模拟数据
  async onModuleInit() {
    const count = await this.restaurantRepository.count();
    if (count === 0) {
      await this.seedMockData();
    }
  }

  // 模拟数据种子
  private async seedMockData() {
    const restaurants = [
      {
        name: '湘菜馆（科技园店）',
        address: '科技园南区A栋1楼',
        phone: '0755-12345678',
        rating: 4.8,
        deliveryFee: 3,
        minOrder: 20,
        discountInfo: {
          '满50减10': { threshold: 50, discount: 10 },
          '满100减30': { threshold: 100, discount: 30 },
          '满200减50': { threshold: 200, discount: 50 },
        },
      },
      {
        name: '粤式茶餐厅',
        address: '科技园南区B栋2楼',
        phone: '0755-23456789',
        rating: 4.6,
        deliveryFee: 2,
        minOrder: 15,
        discountInfo: {
          '满40减8': { threshold: 40, discount: 8 },
          '满80减20': { threshold: 80, discount: 20 },
          '满150减40': { threshold: 150, discount: 40 },
        },
      },
      {
        name: '川味小厨',
        address: '科技园中区C栋1楼',
        phone: '0755-34567890',
        rating: 4.5,
        deliveryFee: 0,
        minOrder: 30,
        discountInfo: {
          '满60减15': { threshold: 60, discount: 15 },
          '满120减35': { threshold: 120, discount: 35 },
        },
      },
      {
        name: '日式便当',
        address: '科技园北区D栋1楼',
        phone: '0755-45678901',
        rating: 4.9,
        deliveryFee: 5,
        minOrder: 25,
        discountInfo: {
          '满80减15': { threshold: 80, discount: 15 },
          '满150减40': { threshold: 150, discount: 40 },
        },
      },
      {
        name: '兰州拉面',
        address: '科技园东区E栋1楼',
        phone: '0755-56789012',
        rating: 4.3,
        deliveryFee: 0,
        minOrder: 18,
        discountInfo: {
          '满45减10': { threshold: 45, discount: 10 },
          '满90减25': { threshold: 90, discount: 25 },
        },
      },
    ];

    for (const r of restaurants) {
      const restaurant = await this.restaurantRepository.save(
        this.restaurantRepository.create(r),
      );

      // 为每个商家创建菜单
      const categories = ['热销', '主食', '小菜', '饮品', '套餐'];
      const menuItems = [
        { name: '农家小炒肉', price: 28, category: '热销', description: '招牌推荐' },
        { name: '剁椒鱼头', price: 48, category: '热销', description: '辣味代表' },
        { name: '酸辣土豆丝', price: 16, category: '小菜', description: '开胃必备' },
        { name: '红烧肉', price: 38, category: '主食', description: '下饭神器' },
        { name: '宫保鸡丁', price: 32, category: '主食', description: '经典川菜' },
        { name: '麻婆豆腐', price: 22, category: '主食', description: '麻辣鲜香' },
        { name: '番茄蛋汤', price: 15, category: '小菜', description: '清淡可口' },
        { name: '拍黄瓜', price: 12, category: '小菜', description: '爽口凉菜' },
        { name: '可乐', price: 6, category: '饮品', description: '快乐水' },
        { name: '雪碧', price: 6, category: '饮品', description: '清爽一下' },
        { name: '米饭', price: 2, category: '主食', description: '东北大米' },
        { name: '红糖糍粑', price: 18, category: '小菜', description: '甜品' },
      ];

      for (const item of menuItems) {
        await this.menuItemRepository.save(
          this.menuItemRepository.create({
            ...item,
            restaurantId: restaurant.id,
          }),
        );
      }
    }

    console.log('模拟商家数据已初始化');
  }

  async findAll(keyword?: string, sort?: string): Promise<Restaurant[]> {
    const qb = this.restaurantRepository.createQueryBuilder('r');

    if (keyword) {
      qb.where('r.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (sort === 'rating') {
      qb.orderBy('r.rating', 'DESC');
    } else if (sort === 'deliveryFee') {
      qb.orderBy('r.deliveryFee', 'ASC');
    } else {
      qb.orderBy('r.createdAt', 'DESC');
    }

    qb.where('r.isActive = :isActive', { isActive: true });

    return qb.getMany();
  }

  async findById(id: string): Promise<Restaurant> {
    return this.restaurantRepository.findOne({ where: { id } });
  }

  async findMenuByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: { restaurantId, isAvailable: true },
      order: { category: 'ASC' },
    });
  }

  async getDiscountInfo(id: string): Promise<any> {
    const restaurant = await this.findById(id);
    return restaurant?.discountInfo || {};
  }
}
