import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Permission } from '../../entity/Permission';

@Module({
	imports: [TypeOrmModule.forFeature([Permission])],
	controllers: [PermissionsController],
	providers: [PermissionsService]
})

export class PermissionsModule {}