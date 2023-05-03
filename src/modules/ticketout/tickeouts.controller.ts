import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { LoggedInUser } from '../../common/decorators/index';
import { CreateTickeoutDto } from './dtos/create-ticket-out.dto';
import { UpdateTicketoutDto } from './dtos/update-ticket-out.dto';
import { GetTicketoutsDto } from "./dtos/get-ticket-outs.dto";
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from 'src/entity/User';
import { TicketoutsService } from './ticketouts.service';

@Controller('ticketouts')
export class TicketoutsController{
	constructor(private ticketoutsService: TicketoutsService){}

	@Get('/:recordId?')
	@HasPermissions('view_ticket_outs')
	list(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId?: number, @Query() qry?: GetTicketoutsDto){
		const args = {...qry!, id: recordId, loggedInUser};
		return this.ticketoutsService.find(args);
	}

	@Post()
	@HasPermissions('add_ticket_outs')
	createCustomer(@LoggedInUser() loggedInUser: User, @Body() body: CreateTickeoutDto){
		const args = {body, loggedInUser};
		return this.ticketoutsService.create(args);
	}

	@Patch('/:recordId')
	@HasPermissions('update_ticket_outs')
	updateCustomer(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string, @Body() body: UpdateTicketoutDto){
		const args = {body, id: parseInt(recordId), loggedInUser};
		return this.ticketoutsService.update(args);
	}

	@Delete('/:recordId')
	@HasPermissions('delete_ticket_outs')
	deleteCustomer(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string){
		const args = {loggedInUser, id: parseInt(recordId)};
		return this.ticketoutsService.delete(args);
	}

}