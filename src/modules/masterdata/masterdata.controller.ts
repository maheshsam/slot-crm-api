import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MasterDataService } from './masterdata.service';
import { CreateSettingsDto } from './dtos/create-settings.dto';
import { UpdateSettingsDto } from './dtos/update-settings.dto';
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';

@Controller('masterdata')
export class MasterDataController{
	constructor(private masterDataService: MasterDataService){}

	@Get('/settings/:id?')
	getCountries(@Param('id') id: string, @Query('qry') qry?: string){
		return this.masterDataService.getSettings(id, qry);
	}

	@Post('/settings')
	@HasPermissions('add_countries')
	createSettings(@Body() body: CreateSettingsDto){
		return this.masterDataService.createSettings(body)
	}

	@Patch('/settings/:id')
	@HasPermissions('update_countries')
	udpateSettings(@Param('id') settingsId: string, @Body() body: UpdateSettingsDto){
		return this.masterDataService.updateSettings(parseInt(settingsId),body);	
	}

	@Delete('/settings/:id')
	@HasPermissions('delete_countries')
	deleteSettings(@Param('id') settingsId: string){
		return this.masterDataService.deleteSettings(parseInt(settingsId));		
	}

}