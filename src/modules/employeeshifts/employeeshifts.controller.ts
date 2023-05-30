import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { LoggedInUser } from '../../common/decorators/index';
import { GetEmployeeShiftsDto } from "./dtos/get-employee-shift.dto";
import { UpsertEmployeeShiftDto } from './dtos/upsert-employee-shift.dto';
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from 'src/entity/User';
import { EmployeeShiftsService } from './employeeshifts.service';

@Controller('employeeshifts')
export class EmployeeShiftsController{
	constructor(private employeeShiftsService: EmployeeShiftsService){}

	@Get('/:recordId?')
	@HasPermissions('view_employee_shift')
	list(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId?: number, @Query() qry?: GetEmployeeShiftsDto){
		const args = {...qry!, id: recordId, loggedInUser};
		return this.employeeShiftsService.find(args);
	}

	@Post()
	@HasPermissions('start_end_employee_shift')
	startEndShift(@LoggedInUser() loggedInUser: User, @Body() body: UpsertEmployeeShiftDto){
		const args = {body, loggedInUser};
		return this.employeeShiftsService.upsert(args);
	}

	@Delete('/:recordId')
	@HasPermissions('delete_employee_shift')
	deleteCustomer(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string){
		const args = {loggedInUser, id: parseInt(recordId)};
		return this.employeeShiftsService.delete(args);
	}

}