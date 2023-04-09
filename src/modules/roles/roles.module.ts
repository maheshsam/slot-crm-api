import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from '../../entity/Role';
import { Permission } from '../../entity/Permission';

@Module({
  imports: [TypeOrmModule.forFeature([Role,Permission])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
