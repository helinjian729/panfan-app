import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: '拼饭团ID' })
  @IsOptional()
  @IsString()
  groupId?: string;
}

export class PayOrderDto {
  @ApiPropertyOptional({ description: '支付方式', enum: ['wechat', 'alipay'] })
  @IsOptional()
  @IsString()
  payMethod?: string;
}
