import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: '拼饭团名称' })
  @IsNotEmpty({ message: '拼饭团名称不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '商家ID' })
  @IsNotEmpty({ message: '商家ID不能为空' })
  @IsString()
  restaurantId: string;

  @ApiPropertyOptional({ description: '目标凑单金额', required: false })
  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @ApiPropertyOptional({ description: '最大成员数', default: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(20)
  maxMembers?: number;

  @ApiPropertyOptional({ description: '截止时间 ISO 字符串', required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  // 兼容旧字段
  @ApiPropertyOptional({ description: '目标人数（旧字段，兼容）', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  targetCount?: number;

  @ApiPropertyOptional({ description: '过期分钟数（旧字段，兼容）', required: false })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  expireMinutes?: number;
}

export class JoinGroupDto {
  @ApiProperty({ description: '邀请码' })
  @IsNotEmpty({ message: '邀请码不能为空' })
  @IsString()
  inviteCode: string;
}

export class AddItemDto {
  @ApiProperty({ description: '菜品ID' })
  @IsNotEmpty({ message: '菜品ID不能为空' })
  @IsString()
  menuItemId: string;

  @ApiProperty({ description: '数量', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
