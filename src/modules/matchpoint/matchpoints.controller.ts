import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { MatchpointsService } from './matchpoints.service';
import { LoggedInUser, Auth } from '../../common/decorators/index';
import { CreateCheckInDto } from './dtos/create-checkin.dto';
import { GetMatchpointsDto } from './dtos/get-matchpoints.dto';
import { AssignMachineNumber } from './dtos/assign-machine-number.dto';
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from '../../entity/User';

@Controller('matchpoints')
export class MatchpointsController{
	constructor(private matchpointsService: MatchpointsService){}

	@Get('/:matchPointId?')
	@HasPermissions('view_match_points')
	list(@LoggedInUser() loggedInUser: User, @Param('matchPointId') matchPointId?: number, @Query() qry?: GetMatchpointsDto){
		const args = {...qry!, match_point_id: matchPointId, loggedInUser};
		return this.matchpointsService.find(args);
	}

	@Post()
	@HasPermissions('check_in_customer')
	createMatchpoint(@LoggedInUser() loggedInUser: User, @Body() body: CreateCheckInDto){
		const args = {body, loggedInUser};
		return this.matchpointsService.checkin(args);
	}

	@Patch('/assign/machine/:matchpointid')
	@HasPermissions('assign_machine')
	updateMatchpoint(@LoggedInUser() loggedInUser: User, @Param('matchpointid') matchpointId: string, @Body() body: AssignMachineNumber){
		const args = {body, loggedInUser, matchpointId: parseInt(matchpointId)};
		return this.matchpointsService.assignMachineNumber(args);
	}

	@Delete('/:matchpointid')
	@HasPermissions('delete_matchpoints')
	deleteMatchpoint(@LoggedInUser() loggedInUser: User, @Param('matchpointid') matchpointId: string){
		const args = {loggedInUser, matchpointId: parseInt(matchpointId)};
		return this.matchpointsService.delete(args);
	}

}