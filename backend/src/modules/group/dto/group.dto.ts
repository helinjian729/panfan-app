import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
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

  @ApiProperty({ description: '目标人数', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  targetCount?: number;

  @ApiProperty({ description: '截止时间（分钟）', default: 30 })
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
