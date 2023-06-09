import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineReadingsController } from './machinereadings.controller';
import { MachineReadingsService } from './machinereadings.service';
import { MachineReading } from '../../entity/MachineReading';
import { User } from '../../entity/User';
import { Machine } from 'src/entity/Machine';

@Module({
	imports: [TypeOrmModule.forFeature([MachineReading,User,Machine])],
	controllers: [MachineReadingsController],
	providers: [MachineReadingsService]
})

export class MachineReadingssModule {}