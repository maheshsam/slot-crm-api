import { Controller, Get, Body, Post, Put, Delete, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dtos/create-location.dto';
import { UpdateLocationDto } from './dtos/update-location.dto';
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';

@Controller('locations')
export class LocationsController{
	constructor(private locationsService: LocationsService){}

	@Get()
	@HasPermissions('view_locations')
	list(){
		return this.locationsService.find();
	}

	@Post()
	@HasPermissions('add_locations')
	createLocation(@Body() body: CreateLocationDto){
		return this.locationsService.create(body);
	}

	@Put('/:locationid')
	@HasPermissions('update_locations')
	updateLocation(@Param('locationid') locationId: string, @Body() body: UpdateLocationDto){
		return this.locationsService.update(parseInt(locationId),body);
	}

	@Delete('/:locationid')
	@HasPermissions('delete_locations')
	deleteLocation(@Param('locationid') locationId: string){
		return this.locationsService.delete(parseInt(locationId));
	}

}