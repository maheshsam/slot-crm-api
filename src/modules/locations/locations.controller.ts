import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dtos/create-location.dto';
import { UpdateLocationDto } from './dtos/update-location.dto';
import { GetLocationsDto } from './dtos/get-locations.dto';
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { LoggedInUser } from '../../common/decorators/index';
import { User } from '../../entity/User';

@Controller('locations')
export class LocationsController{
	constructor(private locationsService: LocationsService){}

	@Get('/:id?')
	@HasPermissions('view_locations')
	list(@LoggedInUser() loggedInUser: User, @Param('id') locationId?: number, @Query() qry?: GetLocationsDto){
		const args = {...qry!, location_id: locationId, loggedInUser};
		return this.locationsService.find(args);
	}

	@Post()
	@HasPermissions('add_locations')
	createLocation(@LoggedInUser() loggedInUser: User, @Body() body: CreateLocationDto){
		const args = {body, loggedInUser};
		return this.locationsService.create(args);
	}

	@Patch('/:locationid')
	@HasPermissions('update_locations')
	updateLocation(@LoggedInUser() loggedInUser: User, @Param('locationid') locationId: string, @Body() body: UpdateLocationDto){
		const args = {body, locationId: parseInt(locationId), loggedInUser};
		return this.locationsService.update(args);
	}

	@Delete('/:locationid')
	@HasPermissions('delete_locations')
	deleteLocation(@LoggedInUser() loggedInUser: User, @Param('locationid') locationId: string){
		return this.locationsService.delete(parseInt(locationId));
	}

}