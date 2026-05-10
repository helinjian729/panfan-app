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
    } else {
      // 删除旧菜单，重新创建各店专属菜单
      await this.resetRestaurantMenus();
    }
  }

  // 删除旧菜单并重建各店专属菜单
  private async resetRestaurantMenus() {
    // 删除所有旧菜单
    await this.menuItemRepository.createQueryBuilder().delete().execute();

    // 图片映射
    const menuImages: Record<string, string> = {
      '农家小炒肉': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop&q=80',
      '剁椒鱼头': 'https://images.unsplash.com/photo-1582452246081-3d22b9bd8e25?w=400&h=300&fit=crop&q=80',
      '酸辣土豆丝': 'https://images.unsplash.com/photo-1626200419199-39118b7f7c96?w=400&h=300&fit=crop&q=80',
      '小炒黄牛肉': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&q=80',
      '虾饺皇': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop&q=80',
      '叉烧包': 'https://images.unsplash.com/photo-1601780193286-0fb95b3tedlg?w=400&h=300&fit=crop&q=80',
      '流沙包': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&q=80',
      '蛋挞': 'https://images.unsplash.com/photo-1509365465985-3d27369b14b3?w=400&h=300&fit=crop&q=80',
      '肠粉': 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=300&fit=crop&q=80',
      '烧鹅': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&q=80',
      '白切鸡': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&q=80',
      '煲仔饭': 'https://images.unsplash.com/photo-1516684732162-798c006a721f?w=400&h=300&fit=crop&q=80',
      '麻婆豆腐': 'https://images.unsplash.com/photo-1582572373968-cb3ea3cdd545?w=400&h=300&fit=crop&q=80',
      '宫保鸡丁': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop&q=80',
      '水煮鱼片': 'https://images.unsplash.com/photo-1582452246081-3d22b9bd8e25?w=400&h=300&fit=crop&q=80',
      '回锅肉': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop&q=80',
      '辣子鸡': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop&q=80',
      '夫妻肺片': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&q=80',
      '酸辣粉': 'https://images.unsplash.com/photo-1626200419199-39118b7f7c96?w=400&h=300&fit=crop&q=80',
      '冰粉': 'https://images.unsplash.com/photo-1558964443-3b5b7e3d3f7a?w=400&h=300&fit=crop&q=80',
      '三文鱼刺身': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&q=80',
      '鳗鱼饭': 'https://images.unsplash.com/photo-1558621730-da83d3f3eb04?w=400&h=300&fit=crop&q=80',
      '天妇罗': 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=300&fit=crop&q=80',
      '味噌汤': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&q=80',
      '味噌拉面': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80',
      '炸猪排': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&q=80',
      '日式咖喱饭': 'https://images.unsplash.com/photo-1516684732162-798c006a721f?w=400&h=300&fit=crop&q=80',
      '寿司拼盘': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&q=80',
      '牛肉拉面': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80',
      '羊肉拉面': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80',
      '凉面': 'https://images.unsplash.com/photo-1626200419199-39118b7f7c96?w=400&h=300&fit=crop&q=80',
      '炸酱面': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80',
      '肉夹馍': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop&q=80',
      '羊肉串': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&q=80',
      '凉拌黄瓜': 'https://images.unsplash.com/photo-1600326145351-3d5971d9280f?w=400&h=300&fit=crop&q=80',
      '米饭': 'https://images.unsplash.com/photo-1516684732162-798c006a721f?w=400&h=300&fit=crop&q=80',
      '可乐': 'https://images.unsplash.com/photo-1554864073-14f2a2df4a2f?w=400&h=300&fit=crop&q=80',
      '雪碧': 'https://images.unsplash.com/photo-1527960471264-932f39eb3a4f?w=400&h=300&fit=crop&q=80',
    };

    // 各店专属菜单
    const restaurantMenus: Record<string, any[]> = {
      '湘菜馆（科技园店）': [
        { name: '剁椒鱼头', price: 48, category: '招牌', description: '湖南经典名菜', imageUrl: menuImages['剁椒鱼头'] },
        { name: '农家小炒肉', price: 32, category: '热销', description: '土家风味', imageUrl: menuImages['农家小炒肉'] },
        { name: '小炒黄牛肉', price: 38, category: '热销', description: '鲜嫩爽滑', imageUrl: menuImages['小炒黄牛肉'] },
        { name: '酸辣土豆丝', price: 18, category: '小菜', description: '酸辣开胃', imageUrl: menuImages['酸辣土豆丝'] },
        { name: '米饭', price: 2, category: '主食', description: '东北大米', imageUrl: menuImages['米饭'] },
        { name: '可乐', price: 6, category: '饮品', description: '快乐水', imageUrl: menuImages['可乐'] },
        { name: '雪碧', price: 6, category: '饮品', description: '清爽一下', imageUrl: menuImages['雪碧'] },
      ],
      '粤式茶餐厅': [
        { name: '虾饺皇', price: 32, category: '招牌', description: '晶莹剔透', imageUrl: menuImages['虾饺皇'] },
        { name: '叉烧包', price: 18, category: '热销', description: '港式经典', imageUrl: menuImages['叉烧包'] },
        { name: '流沙包', price: 16, category: '热销', description: '爆浆流沙', imageUrl: menuImages['流沙包'] },
        { name: '蛋挞', price: 12, category: '小食', description: '酥脆香甜', imageUrl: menuImages['蛋挞'] },
        { name: '肠粉', price: 22, category: '主食', description: '滑嫩爽口', imageUrl: menuImages['肠粉'] },
        { name: '烧鹅', price: 58, category: '招牌', description: '皮脆肉嫩', imageUrl: menuImages['烧鹅'] },
        { name: '白切鸡', price: 42, category: '热销', description: '原汁原味', imageUrl: menuImages['白切鸡'] },
        { name: '煲仔饭', price: 28, category: '主食', description: '锅巴焦香', imageUrl: menuImages['煲仔饭'] },
        { name: '米饭', price: 2, category: '主食', description: '丝苗米', imageUrl: menuImages['米饭'] },
        { name: '可乐', price: 6, category: '饮品', description: '快乐水', imageUrl: menuImages['可乐'] },
      ],
      '川味小厨': [
        { name: '麻婆豆腐', price: 22, category: '招牌', description: '麻辣鲜香', imageUrl: menuImages['麻婆豆腐'] },
        { name: '宫保鸡丁', price: 32, category: '热销', description: '四川名菜', imageUrl: menuImages['宫保鸡丁'] },
        { name: '水煮鱼片', price: 48, category: '招牌', description: '麻辣鲜嫩', imageUrl: menuImages['水煮鱼片'] },
        { name: '回锅肉', price: 28, category: '热销', description: '家常美味', imageUrl: menuImages['回锅肉'] },
        { name: '辣子鸡', price: 38, category: '热销', description: '香辣酥脆', imageUrl: menuImages['辣子鸡'] },
        { name: '夫妻肺片', price: 42, category: '凉菜', description: '麻辣鲜香', imageUrl: menuImages['夫妻肺片'] },
        { name: '酸辣粉', price: 16, category: '主食', description: '酸辣过瘾', imageUrl: menuImages['酸辣粉'] },
        { name: '冰粉', price: 10, category: '甜品', description: '解辣神器', imageUrl: menuImages['冰粉'] },
        { name: '米饭', price: 2, category: '主食', description: '东北大米', imageUrl: menuImages['米饭'] },
        { name: '可乐', price: 6, category: '饮品', description: '快乐水', imageUrl: menuImages['可乐'] },
        { name: '雪碧', price: 6, category: '饮品', description: '清爽一下', imageUrl: menuImages['雪碧'] },
      ],
      '日式便当': [
        { name: '三文鱼刺身', price: 68, category: '招牌', description: '新鲜三文鱼', imageUrl: menuImages['三文鱼刺身'] },
        { name: '鳗鱼饭', price: 58, category: '招牌', description: '酱汁鳗鱼', imageUrl: menuImages['鳗鱼饭'] },
        { name: '天妇罗', price: 38, category: '热销', description: '酥脆可口', imageUrl: menuImages['天妇罗'] },
        { name: '炸猪排', price: 42, category: '热销', description: '外酥里嫩', imageUrl: menuImages['炸猪排'] },
        { name: '味噌拉面', price: 36, category: '主食', description: '浓郁汤底', imageUrl: menuImages['味噌拉面'] },
        { name: '日式咖喱饭', price: 28, category: '主食', description: '咖喱香浓', imageUrl: menuImages['日式咖喱饭'] },
        { name: '味噌汤', price: 12, category: '汤品', description: '日式传统', imageUrl: menuImages['味噌汤'] },
        { name: '寿司拼盘', price: 88, category: '招牌', description: '精选寿司', imageUrl: menuImages['寿司拼盘'] },
        { name: '可乐', price: 8, category: '饮品', description: '罐装可乐', imageUrl: menuImages['可乐'] },
      ],
      '兰州拉面': [
        { name: '牛肉拉面', price: 22, category: '招牌', description: '正宗兰州味', imageUrl: menuImages['牛肉拉面'] },
        { name: '羊肉拉面', price: 26, category: '热销', description: '羊肉鲜美', imageUrl: menuImages['羊肉拉面'] },
        { name: '凉面', price: 16, category: '主食', description: '夏季必点', imageUrl: menuImages['凉面'] },
        { name: '炸酱面', price: 18, category: '主食', description: '老北京风味', imageUrl: menuImages['炸酱面'] },
        { name: '肉夹馍', price: 12, category: '小食', description: '腊肉夹馍', imageUrl: menuImages['肉夹馍'] },
        { name: '羊肉串', price: 8, category: '小食', description: '孜然羊肉', imageUrl: menuImages['羊肉串'] },
        { name: '凉拌黄瓜', price: 10, category: '凉菜', description: '爽口凉菜', imageUrl: menuImages['凉拌黄瓜'] },
        { name: '米饭', price: 2, category: '主食', description: '北方大米', imageUrl: menuImages['米饭'] },
        { name: '可乐', price: 5, category: '饮品', description: '冰镇可乐', imageUrl: menuImages['可乐'] },
        { name: '雪碧', price: 5, category: '饮品', description: '冰镇雪碧', imageUrl: menuImages['雪碧'] },
      ],
    };

    // 获取所有商家
    const restaurants = await this.restaurantRepository.find();

    for (const restaurant of restaurants) {
      const menuItems = restaurantMenus[restaurant.name] || [];
      for (const item of menuItems) {
        await this.menuItemRepository.save(
          this.menuItemRepository.create({
            ...item,
            restaurantId: restaurant.id,
          }),
        );
      }
    }

    console.log('各店专属菜单已重建');
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
      },
      {
        name: '粤式茶餐厅',
        address: '科技园南区B栋2楼',
        phone: '0755-23456789',
        rating: 4.6,
        deliveryFee: 2,
        minOrder: 15,
      },
      {
        name: '川味小厨',
        address: '科技园中区C栋1楼',
        phone: '0755-34567890',
        rating: 4.5,
        deliveryFee: 0,
        minOrder: 30,
      },
      {
        name: '日式便当',
        address: '科技园北区D栋1楼',
        phone: '0755-45678901',
        rating: 4.9,
        deliveryFee: 5,
        minOrder: 25,
      },
      {
        name: '兰州拉面',
        address: '科技园东区E栋1楼',
        phone: '0755-56789012',
        rating: 4.3,
        deliveryFee: 0,
        minOrder: 18,
      },
    ];

    // 统一使用高质量图片
    const menuImages: Record<string, string> = {
      '农家小炒肉': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop&q=80',
      '剁椒鱼头': 'https://images.unsplash.com/photo-1582452246081-3d22b9bd8e25?w=400&h=300&fit=crop&q=80',
      '酸辣土豆丝': 'https://images.unsplash.com/photo-1626200419199-39118b7f7c96?w=400&h=300&fit=crop&q=80',
      '小炒黄牛肉': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&q=80',
      '虾饺皇': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop&q=80',
      '叉烧包': 'https://images.unsplash.com/photo-1601780193286-0fb95b3tedlg?w=400&h=300&fit=crop&q=80',
      '流沙包': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&q=80',
      '蛋挞': 'https://images.unsplash.com/photo-1509365465985-3d27369b14b3?w=400&h=300&fit=crop&q=80',
      '肠粉': 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=300&fit=crop&q=80',
      '烧鹅': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&q=80',
      '白切鸡': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&q=80',
      '煲仔饭': 'https://images.unsplash.com/photo-1516684732162-798c006a721f?w=400&h=300&fit=crop&q=80',
      '麻婆豆腐': 'https://images.unsplash.com/photo-1582572373968-cb3ea3cdd545?w=400&h=300&fit=crop&q=80',
      '宫保鸡丁': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop&q=80',
      '水煮鱼片': 'https://images.unsplash.com/photo-1582452246081-3d22b9bd8e25?w=400&h=300&fit=crop&q=80',
      '回锅肉': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop&q=80',
      '辣子鸡': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop&q=80',
      '夫妻肺片': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&q=80',
      '酸辣粉': 'https://images.unsplash.com/photo-1626200419199-39118b7f7c96?w=400&h=300&fit=crop&q=80',
      '冰粉': 'https://images.unsplash.com/photo-1558964443-3b5b7e3d3f7a?w=400&h=300&fit=crop&q=80',
      '三文鱼刺身': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&q=80',
      '鳗鱼饭': 'https://images.unsplash.com/photo-1558621730-da83d3f3eb04?w=400&h=300&fit=crop&q=80',
      '天妇罗': 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=300&fit=crop&q=80',
      '味噌汤': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&q=80',
      '味噌拉面': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80',
      '炸猪排': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&q=80',
      '日式咖喱饭': 'https://images.unsplash.com/photo-1516684732162-798c006a721f?w=400&h=300&fit=crop&q=80',
      '寿司拼盘': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&q=80',
      '牛肉拉面': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80',
      '羊肉拉面': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80',
      '凉面': 'https://images.unsplash.com/photo-1626200419199-39118b7f7c96?w=400&h=300&fit=crop&q=80',
      '炸酱面': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80',
      '肉夹馍': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop&q=80',
      '羊肉串': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&q=80',
      '凉拌黄瓜': 'https://images.unsplash.com/photo-1600326145351-3d5971d9280f?w=400&h=300&fit=crop&q=80',
      '米饭': 'https://images.unsplash.com/photo-1516684732162-798c006a721f?w=400&h=300&fit=crop&q=80',
      '可乐': 'https://images.unsplash.com/photo-1554864073-14f2a2df4a2f?w=400&h=300&fit=crop&q=80',
      '雪碧': 'https://images.unsplash.com/photo-1527960471264-932f39eb3a4f?w=400&h=300&fit=crop&q=80',
    };

    // 各店专属菜单
    const restaurantMenus: Record<string, any[]> = {
      '湘菜馆（科技园店）': [
        { name: '剁椒鱼头', price: 48, category: '招牌', description: '湖南经典名菜', imageUrl: menuImages['剁椒鱼头'] },
        { name: '农家小炒肉', price: 32, category: '热销', description: '土家风味', imageUrl: menuImages['农家小炒肉'] },
        { name: '小炒黄牛肉', price: 38, category: '热销', description: '鲜嫩爽滑', imageUrl: menuImages['小炒黄牛肉'] },
        { name: '酸辣土豆丝', price: 18, category: '小菜', description: '酸辣开胃', imageUrl: menuImages['酸辣土豆丝'] },
        { name: '米饭', price: 2, category: '主食', description: '东北大米', imageUrl: menuImages['米饭'] },
        { name: '可乐', price: 6, category: '饮品', description: '快乐水', imageUrl: menuImages['可乐'] },
        { name: '雪碧', price: 6, category: '饮品', description: '清爽一下', imageUrl: menuImages['雪碧'] },
      ],
      '粤式茶餐厅': [
        { name: '虾饺皇', price: 32, category: '招牌', description: '晶莹剔透', imageUrl: menuImages['虾饺皇'] },
        { name: '叉烧包', price: 18, category: '热销', description: '港式经典', imageUrl: menuImages['叉烧包'] },
        { name: '流沙包', price: 16, category: '热销', description: '爆浆流沙', imageUrl: menuImages['流沙包'] },
        { name: '蛋挞', price: 12, category: '小食', description: '酥脆香甜', imageUrl: menuImages['蛋挞'] },
        { name: '肠粉', price: 22, category: '主食', description: '滑嫩爽口', imageUrl: menuImages['肠粉'] },
        { name: '烧鹅', price: 58, category: '招牌', description: '皮脆肉嫩', imageUrl: menuImages['烧鹅'] },
        { name: '白切鸡', price: 42, category: '热销', description: '原汁原味', imageUrl: menuImages['白切鸡'] },
        { name: '煲仔饭', price: 28, category: '主食', description: '锅巴焦香', imageUrl: menuImages['煲仔饭'] },
        { name: '米饭', price: 2, category: '主食', description: '丝苗米', imageUrl: menuImages['米饭'] },
        { name: '可乐', price: 6, category: '饮品', description: '快乐水', imageUrl: menuImages['可乐'] },
      ],
      '川味小厨': [
        { name: '麻婆豆腐', price: 22, category: '招牌', description: '麻辣鲜香', imageUrl: menuImages['麻婆豆腐'] },
        { name: '宫保鸡丁', price: 32, category: '热销', description: '四川名菜', imageUrl: menuImages['宫保鸡丁'] },
        { name: '水煮鱼片', price: 48, category: '招牌', description: '麻辣鲜嫩', imageUrl: menuImages['水煮鱼片'] },
        { name: '回锅肉', price: 28, category: '热销', description: '家常美味', imageUrl: menuImages['回锅肉'] },
        { name: '辣子鸡', price: 38, category: '热销', description: '香辣酥脆', imageUrl: menuImages['辣子鸡'] },
        { name: '夫妻肺片', price: 42, category: '凉菜', description: '麻辣鲜香', imageUrl: menuImages['夫妻肺片'] },
        { name: '酸辣粉', price: 16, category: '主食', description: '酸辣过瘾', imageUrl: menuImages['酸辣粉'] },
        { name: '冰粉', price: 10, category: '甜品', description: '解辣神器', imageUrl: menuImages['冰粉'] },
        { name: '米饭', price: 2, category: '主食', description: '东北大米', imageUrl: menuImages['米饭'] },
        { name: '可乐', price: 6, category: '饮品', description: '快乐水', imageUrl: menuImages['可乐'] },
        { name: '雪碧', price: 6, category: '饮品', description: '清爽一下', imageUrl: menuImages['雪碧'] },
      ],
      '日式便当': [
        { name: '三文鱼刺身', price: 68, category: '招牌', description: '新鲜三文鱼', imageUrl: menuImages['三文鱼刺身'] },
        { name: '鳗鱼饭', price: 58, category: '招牌', description: '酱汁鳗鱼', imageUrl: menuImages['鳗鱼饭'] },
        { name: '天妇罗', price: 38, category: '热销', description: '酥脆可口', imageUrl: menuImages['天妇罗'] },
        { name: '炸猪排', price: 42, category: '热销', description: '外酥里嫩', imageUrl: menuImages['炸猪排'] },
        { name: '味噌拉面', price: 36, category: '主食', description: '浓郁汤底', imageUrl: menuImages['味噌拉面'] },
        { name: '日式咖喱饭', price: 28, category: '主食', description: '咖喱香浓', imageUrl: menuImages['日式咖喱饭'] },
        { name: '味噌汤', price: 12, category: '汤品', description: '日式传统', imageUrl: menuImages['味噌汤'] },
        { name: '寿司拼盘', price: 88, category: '招牌', description: '精选寿司', imageUrl: menuImages['寿司拼盘'] },
        { name: '可乐', price: 8, category: '饮品', description: '罐装可乐', imageUrl: menuImages['可乐'] },
      ],
      '兰州拉面': [
        { name: '牛肉拉面', price: 22, category: '招牌', description: '正宗兰州味', imageUrl: menuImages['牛肉拉面'] },
        { name: '羊肉拉面', price: 26, category: '热销', description: '羊肉鲜美', imageUrl: menuImages['羊肉拉面'] },
        { name: '凉面', price: 16, category: '主食', description: '夏季必点', imageUrl: menuImages['凉面'] },
        { name: '炸酱面', price: 18, category: '主食', description: '老北京风味', imageUrl: menuImages['炸酱面'] },
        { name: '肉夹馍', price: 12, category: '小食', description: '腊肉夹馍', imageUrl: menuImages['肉夹馍'] },
        { name: '羊肉串', price: 8, category: '小食', description: '孜然羊肉', imageUrl: menuImages['羊肉串'] },
        { name: '凉拌黄瓜', price: 10, category: '凉菜', description: '爽口凉菜', imageUrl: menuImages['凉拌黄瓜'] },
        { name: '米饭', price: 2, category: '主食', description: '北方大米', imageUrl: menuImages['米饭'] },
        { name: '可乐', price: 5, category: '饮品', description: '冰镇可乐', imageUrl: menuImages['可乐'] },
        { name: '雪碧', price: 5, category: '饮品', description: '冰镇雪碧', imageUrl: menuImages['雪碧'] },
      ],
    };

    for (const r of restaurants) {
      const restaurant = await this.restaurantRepository.save(
        this.restaurantRepository.create(r),
      );

      const menuItems = restaurantMenus[r.name] || [];

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

    qb.where('r.isActive = :isActive', { isActive: true });

    if (keyword) {
      qb.andWhere('r.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (sort === 'rating') {
      qb.orderBy('r.rating', 'DESC');
    } else if (sort === 'deliveryFee') {
      qb.orderBy('r.deliveryFee', 'ASC');
    } else {
      qb.orderBy('r.createdAt', 'DESC');
    }

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
