import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';

@ApiTags('商家')
@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  @ApiOperation({ summary: '获取商家列表' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['rating', 'sales', 'deliveryFee'] })
  async getList(
    @Query('keyword') keyword?: string,
    @Query('sort') sort?: string,
  ) {
    return this.restaurantService.findAll(keyword, sort);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商家详情' })
  async getDetail(@Param('id') id: string) {
    return this.restaurantService.findById(id);
  }

  @Get(':id/menu')
  @ApiOperation({ summary: '获取商家菜单' })
  async getMenu(@Param('id') id: string) {
    return this.restaurantService.findMenuByRestaurantId(id);
  }

  @Get(':id/discount-info')
  @ApiOperation({ summary: '获取商家满减信息' })
  async getDiscountInfo(@Param('id') id: string) {
    return this.restaurantService.getDiscountInfo(id);
  }
}
