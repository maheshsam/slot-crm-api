import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { MachineReadingsService } from './machinereadings.service';
import { LoggedInUser } from '../../common/decorators/index';
import { UpsertMachineReadingDto } from './dtos/upsert-machine-reading.dto';
import { GetMachineReadingssDto } from "./dtos/get-machine-readings.dto";
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from '../../entity/User';

@Controller('machinereadings')
export class MachineReadingsController{
	constructor(private machineReadingsService: MachineReadingsService){}

	@Get()
	@HasPermissions('view_machine_readings')
	list(@LoggedInUser() loggedInUser: User, @Param('readingId') readingId?: number, @Query() qry?: GetMachineReadingssDto){
		const args = {...qry!, loggedInUser};
		return this.machineReadingsService.find(args);
	}

	@Post()
	@HasPermissions('add_machine_readings')
	upsertMachineReading(@LoggedInUser() loggedInUser: User, @Body() body: UpsertMachineReadingDto){
		const args = {body, loggedInUser};
		return this.machineReadingsService.upsert(args);
	}

	@Delete()
	@HasPermissions('delete_machine_readings')
	deleteMachineReading(@LoggedInUser() loggedInUser: User, @Body() body: UpsertMachineReadingDto){
		const args = {loggedInUser, body};
		return this.machineReadingsService.delete(args);
	}

}