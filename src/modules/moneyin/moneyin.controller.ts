import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { LoggedInUser } from '../../common/decorators/index';
import { CreateMoneyInDto } from './dtos/create-money-in.dto';
import { UpdateMoneyDto } from './dtos/update-money-in.dto';
import { GetMoneyInDto } from "./dtos/get-money-in.dto";
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from 'src/entity/User';
import { MoneyInService } from './moneyin.service';
import { MoneyInType } from 'src/entity/MoneyIn';

@Controller('moneyin')
export class MoneyInController{
	constructor(private moneyInService: MoneyInService){}

	@Get('/bank/:recordId?')
	@HasPermissions('view_bank')
	listBank(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId?: number, @Query() qry?: GetMoneyInDto){
		const args = {...qry!, id: recordId, loggedInUser, money_in_type: MoneyInType.BANK};
		return this.moneyInService.find(args);
	}

	@Get('/pull/:recordId?')
	@HasPermissions('view_pull')
	listPull(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId?: number, @Query() qry?: GetMoneyInDto){
		const args = {...qry!, id: recordId, loggedInUser, money_in_type: MoneyInType.PULL};
		return this.moneyInService.find(args);
	}

	@Post('/bank')
	@HasPermissions('add_bank')
	createBank(@LoggedInUser() loggedInUser: User, @Body() body: CreateMoneyInDto){
		body['money_in_type'] = MoneyInType.BANK;
		const args = {body, loggedInUser};
		return this.moneyInService.create(args);
	}

	@Post('/pull')
	@HasPermissions('add_pull')
	createPull(@LoggedInUser() loggedInUser: User, @Body() body: CreateMoneyInDto){
		body['money_in_type'] = MoneyInType.PULL;
		const args = {body, loggedInUser};
		return this.moneyInService.create(args);
	}

	@Patch('/bank/:recordId')
	@HasPermissions('update_bank')
	updateBank(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string, @Body() body: UpdateMoneyDto){
		const args = {body, id: parseInt(recordId), loggedInUser};
		return this.moneyInService.update(args);
	}

	@Patch('/pull/:recordId')
	@HasPermissions('update_pull')
	updatePull(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string, @Body() body: UpdateMoneyDto){
		const args = {body, id: parseInt(recordId), loggedInUser};
		return this.moneyInService.update(args);
	}

	@Delete('/bank/:recordId')
	@HasPermissions('delete_bank')
	deleteBank(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string){
		const args = {loggedInUser, id: parseInt(recordId)};
		return this.moneyInService.delete(args);
	}

	@Delete('/pull/:recordId')
	@HasPermissions('delete_pull')
	deletePull(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string){
		const args = {loggedInUser, id: parseInt(recordId)};
		return this.moneyInService.delete(args);
	}

}