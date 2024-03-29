import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { MatchpointsService } from './matchpoints.service';
import { LoggedInUser, Auth } from '../../common/decorators/index';
import { CreateCheckInDto } from './dtos/create-checkin.dto';
import { GetMatchpointsDto } from './dtos/get-matchpoints.dto';
import { FinalisedMatchPoint } from './dtos/finalised-match-point';
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from '../../entity/User';
import { UpdateCustomerDto } from '../customers/dtos/update-customer.dto';
import { UpdateMatchPointDto } from './dtos/update-match-point-dto';

@Controller('matchpoints')
export class MatchpointsController{
	constructor(private matchpointsService: MatchpointsService){}

	@Get('/:matchPointId?')
	@HasPermissions('view_match_points')
	list(@LoggedInUser() loggedInUser: User, @Param('matchPointId') matchPointId?: number, @Query() qry?: GetMatchpointsDto){
		const args = {...qry!, matchpoint_id: matchPointId, loggedInUser};
		return this.matchpointsService.find(args);
	}

	@Post()
	@HasPermissions('check_in_customer')
	createMatchpoint(@LoggedInUser() loggedInUser: User, @Body() body: CreateCheckInDto){
		const args = {body, loggedInUser};
		return this.matchpointsService.checkin(args);
	}

	@Patch('/finalised/:matchpointid')
	@HasPermissions('finalised_matchpoint')
	updateMatchpoint(@LoggedInUser() loggedInUser: User, @Param('matchpointid') matchpointId: string, @Body() body: FinalisedMatchPoint){
		const args = {body, loggedInUser, matchpointId: parseInt(matchpointId)};
		return this.matchpointsService.finalisedMatchPoint(args);
	}

	@Patch('/update/:recordId')
	@HasPermissions('update_match_points')
	updateCustomer(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string, @Body() body: UpdateMatchPointDto){
		const args = {body, id: parseInt(recordId), loggedInUser};
		return this.matchpointsService.update(args);
	}

	@Delete('/:matchpointid')
	@HasPermissions('delete_matchpoints')
	deleteMatchpoint(@LoggedInUser() loggedInUser: User, @Param('matchpointid') matchpointId: string){
		const args = {loggedInUser, matchpointId: parseInt(matchpointId)};
		return this.matchpointsService.delete(args);
	}

}