import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeShiftsController } from './employeeshifts.controller';
import { EmployeeShiftsService } from './employeeshifts.service';
import { User } from '../../entity/User';
import { EmployeeShift } from 'src/entity/EmployeeShift';

@Module({
	imports: [TypeOrmModule.forFeature([User, EmployeeShift])],
	controllers: [EmployeeShiftsController],
	providers: [EmployeeShiftsService]
})

export class EmployeeShiftsModule {}