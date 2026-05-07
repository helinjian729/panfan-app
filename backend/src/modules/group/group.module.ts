import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupOrderItem } from './entities/group-order-item.entity';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMember, GroupOrderItem]),
    RestaurantModule,
    AuthModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
