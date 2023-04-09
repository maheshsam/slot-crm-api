import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateLocationDto } from './dtos/create-location.dto';
import { UpdateLocationDto } from './dtos/update-location.dto';
import { Location } from '../../entity/Location';
import { User } from '../../entity/User';

@Injectable()
export class LocationsService{
	constructor(
		@InjectRepository(Location) private repo: Repository<Location>,
		@InjectRepository(User) private repoUser: Repository<User>
	){}

	find(){
		return this.repo.find();
	}

	findOne(id: number){
		return this.repo.findOne({ where: {id: id}});
	}

	async create(locationDto: CreateLocationDto) {
		const locationNameExists = await this.repo.findOne({where:{location_name: locationDto.location_name}});
	    if (locationNameExists) {
	      throw new ConflictException('Location with given name already exists');
	    }

		const location = this.repo.create(locationDto);
		if(locationDto.userId){
			const user = await this.repoUser.findOne({where: {id: locationDto.userId}});
			if(user){
				location.user = user;
			}
		}
		return this.repo.save(location);
	}

	async update(locationId: number, locationDto:UpdateLocationDto) {
		const locationNameExists = await this.repo.findOne({where:{location_name: locationDto.location_name, id: Not(Equal(locationId))}});
	    if (locationNameExists) {
	      throw new ConflictException('Location with given name already exists');
	    }
	    const userId = locationDto.userId;
	    delete locationDto.userId;
		const location = await this.repo.findOne({where: {id: locationId}, relations: {user: true}});
		if(!location){
			throw new NotFoundException('Location not found');
		}
		await this.repo.update(locationId,locationDto);
		if(userId){
			const user = await this.repoUser.findOne({where: {id: userId}});
			if(user){
				location.user = user;
			}
		}
		return location;
	}

	async delete(locationId: number) {
		const location = await this.repo.findOne({ where: {id: locationId}});
		if(!location){
			throw new NotFoundException;
		}
		return this.repo.delete(location);
	}

}