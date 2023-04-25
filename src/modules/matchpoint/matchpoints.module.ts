import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchpointsController } from './matchpoints.controller';
import { MatchpointsService } from './matchpoints.service';
import { MatchPoint } from '../../entity/MatchPoint';
import { User } from '../../entity/User';
import { Customer } from '../../entity/Customer';

@Module({
	imports: [TypeOrmModule.forFeature([MatchPoint,User,Customer])],
	controllers: [MatchpointsController],
	providers: [MatchpointsService]
})

export class MatchpointsModule {}