import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { Location } from '../../entity/Location';
import { User } from '../../entity/User';

@Module({
	imports: [TypeOrmModule.forFeature([Location,User])],
	controllers: [LocationsController],
	providers: [LocationsService]
})

export class LocationsModule {}