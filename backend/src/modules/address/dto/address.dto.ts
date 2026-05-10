import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: '收货人姓名' })
  @IsString()
  @IsNotEmpty()
  receiver: string;

  @ApiProperty({ description: '联系电话' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: '省' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ description: '市' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: '区' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ description: '详细地址' })
  @IsString()
  @IsNotEmpty()
  detail: string;

  @ApiPropertyOptional({ description: '标签（家/公司）' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: '设为默认地址' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ description: '收货人姓名' })
  @IsOptional()
  @IsString()
  receiver?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '省' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: '市' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '区' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: '详细地址' })
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiPropertyOptional({ description: '标签（家/公司）' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: '设为默认地址' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}