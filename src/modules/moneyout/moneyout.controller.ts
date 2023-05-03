import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { LoggedInUser } from '../../common/decorators/index';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { CreateBonusDto } from './dtos/create-bonus.dto';
import { UpdateMoneyDto } from './dtos/update-money-out.dto';
import { GetMoneyOutDto } from "./dtos/get-money-out.dto";
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from 'src/entity/User';
import { MoneyOutService } from './moneyout.service';
import { MoneyOutType } from 'src/entity/MoneyOut';

@Controller('moneyout')
export class MoneyOutController{
	constructor(private moneyOutService: MoneyOutService){}

	@Get('/expenses/:recordId?')
	@HasPermissions('view_expenses')
	listExpenses(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId?: number, @Query() qry?: GetMoneyOutDto){
		const args = {...qry!, id: recordId, loggedInUser, money_out_type: MoneyOutType.EXPENSES};
		return this.moneyOutService.find(args);
	}

	@Get('/bonus/:recordId?')
	@HasPermissions('view_pull')
	listBonus(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId?: number, @Query() qry?: GetMoneyOutDto){
		const args = {...qry!, id: recordId, loggedInUser, money_out_type: MoneyOutType.BONUS};
		return this.moneyOutService.find(args);
	}

	@Post('/expenses')
	@HasPermissions('add_expenses')
	createExpense(@LoggedInUser() loggedInUser: User, @Body() body: CreateExpenseDto){
		body['money_out_type'] = MoneyOutType.EXPENSES;
		const args = {body, loggedInUser};
		return this.moneyOutService.create(args);
	}

	@Post('/bonus')
	@HasPermissions('add_pull')
	createBonus(@LoggedInUser() loggedInUser: User, @Body() body: CreateBonusDto){
		body['money_out_type'] = MoneyOutType.BONUS;
		const args = {body, loggedInUser};
		return this.moneyOutService.create(args);
	}

	@Patch('/expenses/:recordId')
	@HasPermissions('update_expenses')
	updateExpense(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string, @Body() body: UpdateMoneyDto){
		const args = {body, id: parseInt(recordId), loggedInUser};
		return this.moneyOutService.update(args);
	}

	@Patch('/bonus/:recordId')
	@HasPermissions('update_bonus')
	updateBonus(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string, @Body() body: UpdateMoneyDto){
		const args = {body, id: parseInt(recordId), loggedInUser};
		return this.moneyOutService.update(args);
	}

	@Delete('/expenses/:recordId')
	@HasPermissions('delete_expenses')
	deleteExpenses(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string){
		const args = {loggedInUser, id: parseInt(recordId)};
		return this.moneyOutService.delete(args);
	}

	@Delete('/bonus/:recordId')
	@HasPermissions('delete_bonus')
	deleteBonus(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string){
		const args = {loggedInUser, id: parseInt(recordId)};
		return this.moneyOutService.delete(args);
	}

}