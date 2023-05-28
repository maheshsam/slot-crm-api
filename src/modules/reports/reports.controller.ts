import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { LoggedInUser } from '../../common/decorators/index';
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from '../../entity/User';
import { GetProfitLossDto } from './dtos/get-profit-loss.dto';

@Controller('reports')
export class ReportsController{
	constructor(private reportsService: ReportsService){}

	@Get('/profit-loss')
	@HasPermissions('view_pl_report')
	list(@LoggedInUser() loggedInUser: User, @Query() qry?: GetProfitLossDto){
		const args = {...qry!, loggedInUser};
		return this.reportsService.profitloss(args);
	}

}