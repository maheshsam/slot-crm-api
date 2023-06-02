import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { LoggedInUser } from '../../common/decorators/index';
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from '../../entity/User';
import { GetProfitLossDto } from './dtos/get-profit-loss.dto';
import { GetEmpShiftSummaryDto } from './dtos/get-emp-shift-summary.dto';

@Controller('reports')
export class ReportsController{
	constructor(private reportsService: ReportsService){}

	@Get('/profit-loss')
	@HasPermissions('view_pl_report')
	getPL(@LoggedInUser() loggedInUser: User, @Query() qry?: GetProfitLossDto){
		const args = {...qry!, loggedInUser};
		return this.reportsService.profitloss(args);
	}

	@Get('/emp-shift-summary')
	@HasPermissions('view_employee_shift_summary')
	getEmpSummary(@LoggedInUser() loggedInUser: User, @Query() qry?: GetEmpShiftSummaryDto){
		const args = {...qry!, loggedInUser};
		return this.reportsService.empshiftsummary(args);
	}

	@Get('/match-points')
	@HasPermissions('view_match_points_report')
	getMatchPointsReport(@LoggedInUser() loggedInUser: User, @Query() qry?: GetEmpShiftSummaryDto){
		const args = {...qry!, loggedInUser};
		return this.reportsService.matchPointsReport(args);
	}

	@Get('/ticketouts-bonuses')
	@HasPermissions('view_ticketouts_bonuses_report')
	getTicketoutsBonuses(@LoggedInUser() loggedInUser: User, @Query() qry?: GetEmpShiftSummaryDto){
		const args = {...qry!, loggedInUser};
		return this.reportsService.ticketoutsBonusesReport(args);
	}

}