import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { LoggedInUser } from '../../common/decorators/index';
import { CreatePromotionDto } from './dtos/create-promotion.dto';
import { UpdatePromotionDto } from './dtos/update-promotion.dto';
import { GetPromotionsDto } from "./dtos/get-promotions.dto";
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from 'src/entity/User';
import { PromotionsService } from './promotions.service';
import { PromotionType, PrizeType } from 'src/entity/Promotion';

@Controller('promotions')
export class PromotionsController{
	constructor(private promotionsService: PromotionsService){}

	@Get('/raffle/:recordId?')
	@HasPermissions('view_raffle')
	listRaffle(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId?: number, @Query() qry?: GetPromotionsDto){
		const args = {...qry!, id: recordId, loggedInUser, promotion_type: PromotionType.RAFFLE};
		return this.promotionsService.find(args);
	}

	@Get('/drawings/:recordId?')
	@HasPermissions('view_drawings')
	list(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId?: number, @Query() qry?: GetPromotionsDto){
		const args = {...qry!, id: recordId, loggedInUser, promotion_type: PromotionType.DRAWINGS};
		return this.promotionsService.find(args);
	}

	@Post('/raffle')
	@HasPermissions('add_raffle')
	createRaffle(@LoggedInUser() loggedInUser: User, @Body() body: CreatePromotionDto){
		body['promotion_type'] = PromotionType.RAFFLE;
		body['prize_type'] = body.prize_type == "cash" ? PrizeType.CASH : PrizeType.OTHER;
		const args = {body, loggedInUser};
		return this.promotionsService.create(args);
	}

	@Post('/drawings')
	@HasPermissions('add_drawings')
	createDrawing(@LoggedInUser() loggedInUser: User, @Body() body: CreatePromotionDto){
		body['promotion_type'] = PromotionType.DRAWINGS;
		body['prize_type'] = body.prize_type == "cash" ? PrizeType.CASH : PrizeType.OTHER;
		const args = {body, loggedInUser};
		return this.promotionsService.create(args);
	}

	@Patch('/raffle/:recordId')
	@HasPermissions('update_raffle')
	updateRaffle(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string, @Body() body: UpdatePromotionDto){
		const args = {body, id: parseInt(recordId), loggedInUser};
		return this.promotionsService.update(args);
	}

	@Patch('/drawings/:recordId')
	@HasPermissions('update_drawings')
	updateDrawings(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string, @Body() body: UpdatePromotionDto){
		const args = {body, id: parseInt(recordId), loggedInUser};
		return this.promotionsService.update(args);
	}

	@Delete('/raffle/:recordId')
	@HasPermissions('delete_raffle')
	deleteRaffle(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string){
		const args = {loggedInUser, id: parseInt(recordId)};
		return this.promotionsService.delete(args);
	}

	@Delete('/drawings/:recordId')
	@HasPermissions('delete_drawings')
	deleteDrawings(@LoggedInUser() loggedInUser: User, @Param('recordId') recordId: string){
		const args = {loggedInUser, id: parseInt(recordId)};
		return this.promotionsService.delete(args);
	}

}