import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachinesController } from './machines.controller';
import { MachinesService } from './machines.service';
import { Machine } from '../../entity/Machine';
import { User } from '../../entity/User';

@Module({
	imports: [TypeOrmModule.forFeature([Machine,User])],
	controllers: [MachinesController],
	providers: [MachinesService]
})

export class MachinesModule {}