import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { MachineReading } from '../../entity/MachineReading';
import { User } from '../../entity/User';
import { MoneyIn } from 'src/entity/MoneyIn';
import { MoneyOut } from 'src/entity/MoneyOut';
import { Promotion } from 'src/entity/Promotion';
import { MatchPoint } from 'src/entity/MatchPoint';
import { TicketOut } from 'src/entity/TicketOut';
import { Machine } from 'src/entity/Machine';
import { EmployeeShift } from 'src/entity/EmployeeShift';

@Module({
	imports: [TypeOrmModule.forFeature([MachineReading,User,MoneyIn, MoneyOut, Promotion, MatchPoint, TicketOut, User, Machine, EmployeeShift])],
	controllers: [ReportsController],
	providers: [ReportsService]
})

export class ReportsModule {}