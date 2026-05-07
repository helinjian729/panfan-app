import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { CreateGroupDto, JoinGroupDto, AddItemDto } from './dto/group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('拼饭团')
@Controller('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: '发起拼饭团' })
  async create(@Request() req, @Body() dto: CreateGroupDto) {
    return this.groupService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取拼饭团列表' })
  @ApiQuery({ name: 'type', required: false, enum: ['created', 'joined'] })
  async getList(
    @Request() req,
    @Query('type') type?: 'created' | 'joined',
  ) {
    return this.groupService.findByUser(req.user.userId, type || 'created');
  }

  @Get('nearby')
  @ApiOperation({ summary: '获取附近可加入的拼饭团' })
  async getNearby() {
    return this.groupService.findNearby();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取拼饭团详情' })
  async getDetail(@Param('id') id: string, @Request() req) {
    return this.groupService.findById(id, req.user.userId);
  }

  @Post('join')
  @ApiOperation({ summary: '加入拼饭团' })
  async join(@Request() req, @Body() dto: JoinGroupDto) {
    return this.groupService.join(req.user.userId, dto.inviteCode);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消拼饭团（仅发起人）' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.groupService.cancel(id, req.user.userId);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: '退出拼饭团（成员）' })
  async leave(@Param('id') id: string, @Request() req) {
    return this.groupService.leave(id, req.user.userId);
  }

  @Get(':id/items')
  @ApiOperation({ summary: '获取拼饭团菜品清单' })
  async getItems(@Param('id') id: string) {
    return this.groupService.getGroupItems(id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: '添加菜品到拼饭团' })
  async addItem(@Param('id') id: string, @Request() req, @Body() dto: AddItemDto) {
    return this.groupService.addItem(id, req.user.userId, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: '删除拼饭团菜品' })
  async removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Request() req,
  ) {
    return this.groupService.removeItem(id, itemId, req.user.userId);
  }

  @Get(':id/calculate')
  @ApiOperation({ summary: '计算凑单进度' })
  async calculate(@Param('id') id: string) {
    return this.groupService.getDiscountCalculation(id);
  }
}
