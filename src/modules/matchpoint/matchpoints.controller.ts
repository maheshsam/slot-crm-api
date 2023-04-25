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
	list(@Param('matchPointId') matchPointId?: number, @Query() qry?: GetMatchpointsDto){
		const args = {...qry!, match_point_id: matchPointId};
		return this.matchpointsService.find(args);
	}

	@Post()
	@HasPermissions('add_check_in')
	createMatchpoint(@LoggedInUser() user: User, @Body() body: CreateCheckInDto){
		return this.matchpointsService.checkin(user,body);
	}

	@Patch('/assign/:matchpointid')
	@HasPermissions('assign_machine_number')
	updateMatchpoint(@Param('matchpointid') matchpointId: string, @Body() body: AssignMachineNumber){
		return this.matchpointsService.assignMachineNumber(parseInt(matchpointId),body);
	}

	@Delete('/:matchpointid')
	@HasPermissions('delete_matchpoints')
	deleteMatchpoint(@Param('matchpointid') matchpointId: string){
		return this.matchpointsService.delete(parseInt(matchpointId));
	}

}