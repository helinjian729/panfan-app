import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('地址管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: '获取用户所有地址' })
  async findAll(@Request() req) {
    return this.addressService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个地址详情' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.addressService.findOne(id, req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: '新增地址' })
  async create(@Request() req, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新地址' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除地址' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.addressService.remove(id, req.user.userId);
    return { success: true };
  }

  @Put(':id/default')
  @ApiOperation({ summary: '设置默认地址' })
  async setDefault(@Param('id') id: string, @Request() req) {
    return this.addressService.setDefault(id, req.user.userId);
  }
}