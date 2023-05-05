import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { LoggedInUser } from '../../common/decorators/index';
import { CreateMachineDto } from './dtos/create-machine.dto';
import { UpdateMachineDto } from './dtos/update-machine.dto';
import { GetMachinesDto } from "./dtos/get-machines.dto";
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from '../../entity/User';

@Controller('machines')
export class MachinesController{
	constructor(private machinesService: MachinesService){}

	@Get('/:machineId?')
	@HasPermissions('view_machines')
	list(@LoggedInUser() loggedInUser: User, @Param('machineId') machineId?: number, @Query() qry?: GetMachinesDto){
		const args = {...qry!, machineId: machineId, loggedInUser};
		return this.machinesService.find(args);
	}

	@Post()
	@HasPermissions('add_machines')
	createCustomer(@LoggedInUser() loggedInUser: User, @Body() body: CreateMachineDto){
		const args = {body, loggedInUser};
		return this.machinesService.create(args);
	}

	@Patch('/:machineId')
	@HasPermissions('update_machines')
	updateCustomer(@LoggedInUser() loggedInUser: User, @Param('machineId') machineId: number, @Body() body: UpdateMachineDto){
		const args = {body, machineId: machineId, loggedInUser};
		return this.machinesService.update(args);
	}

	@Delete('/:machineId')
	@HasPermissions('delete_machines')
	deleteCustomer(@LoggedInUser() loggedInUser: User, @Param('machineId') machineId: number){
		const args = {loggedInUser, machineId};
		return this.machinesService.delete(args);
	}

}