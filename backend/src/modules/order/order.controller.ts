import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, PayOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('订单')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.orderService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  async getList(@Request() req) {
    return this.orderService.findByUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async getDetail(@Param('id') id: string, @Request() req) {
    return this.orderService.findById(id, req.user.userId);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '支付订单' })
  async pay(@Param('id') id: string, @Request() req, @Body() dto: PayOrderDto) {
    return this.orderService.pay(id, req.user.userId, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.orderService.cancel(id, req.user.userId);
  }
}
