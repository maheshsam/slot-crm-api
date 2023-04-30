import { Injectable, NotFoundException, ConflictException, BadRequestException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateLocationDto } from './dtos/create-location.dto';
import { UpdateLocationDto } from './dtos/update-location.dto';
import {GetLocationsDto} from './dtos/get-locations.dto';
import { Location } from '../../entity/Location';
import { User } from '../../entity/User';
import { createPaginationObject, Pagination } from "../../lib/pagination";

@Injectable()
export class LocationsService{
	constructor(
		@InjectRepository(Location) private repo: Repository<Location>,
		@InjectRepository(User) private repoUser: Repository<User>
	){}

	async find(args?: GetLocationsDto){
		const page = args.page || 1; 
		const limit = args.items_per_page || 100000;
		if(args.location_id && args.location_id != undefined){
			return this.repo.find({where: {id: args.location_id}, relations: { owner: true }});
		}
		try{
			if(Object.keys(args).length > 0){
				const locationsQuery = this.repo.createQueryBuilder("location");
				locationsQuery.leftJoinAndSelect("location.owner", "user");
				if(args.search && args.search != ""){
					locationsQuery.where("LOWER(location.location_name) LIKE LOWER(:qry) OR LOWER(location.details) LIKE LOWER(:qry) OR LOWER(location.comments) LIKE LOWER(:qry) OR LOWER(location.address_line_1) LIKE LOWER(:qry) OR LOWER(location.address_line_2) LIKE LOWER(:qry) OR LOWER(location.address_line_3) LIKE LOWER(:qry) OR LOWER(location.city) LIKE LOWER(:qry) OR LOWER(location.state) LIKE LOWER(:qry) OR LOWER(location.country) LIKE LOWER(:qry)", { qry: `%${args.search}%` });
				}
				if(args.status !== undefined && args.status !== ""){
					locationsQuery.where("location.is_active = :status",{status: String(args.status) == '1' ? true : false});
				}
				if(args.user && args.user !== null){
					const users = await this.repoUser.find({where: { id: args.user}});
					if(users.length > 0){
						const userIds = users.map((item) => {
							return item.id;
						})
						locationsQuery.where("user.id IN (:users)",{ users: userIds});
					}else{
						locationsQuery.where("user.id = :user",{ user: 0});
					}
				}		
				const total = await locationsQuery.getCount();
				const results = await locationsQuery.skip(page-1).take(limit).getMany();
				return createPaginationObject<Location>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		return createPaginationObject<Location>(await this.repo.find({relations: { owner: true }}), await this.repo.count(), page, limit);
	}

	findOne(id: number){
		return this.repo.findOne({ where: {id}, relations: { owner: true }});
	}

	async create(locationDto: CreateLocationDto) {
		const locationNameExists = await this.repo.findOne({where:{location_name: locationDto.location_name}});
	    if (locationNameExists) {
	      	throw new ConflictException('Location with given name already exists');
	    }
		if(locationDto.userId == undefined || locationDto.userId == null){
			throw new BadRequestException('Location with given name already exists');
		}
		const userId = locationDto.userId;
		const owner = await this.repoUser.findOne({where: {id: userId}});
		let ownerErrMsg = '';
		if(owner){
			const locationOwnerExists = await this.repo.find({where:{owner}});
			if(locationOwnerExists.length > 0){
				ownerErrMsg = 'Owner has been already assigned to different location';
				throw new NotAcceptableException(ownerErrMsg);
			}
		}else{
			ownerErrMsg = 'Invalid owner';
			throw new NotAcceptableException(ownerErrMsg);
		}
		const location = this.repo.create(locationDto);
		if(locationDto.userId){
			const user = await this.repoUser.findOne({where: {id: locationDto.userId}});
			if(user){
				location.owner = user;
			}
		}
		return this.repo.save(location);
	}

	async update(locationId: number, locationDto:UpdateLocationDto) {
		const locationNameExists = await this.repo.findOne({where:{location_name: locationDto.location_name, id: Not(Equal(locationId))}});
	    if (locationNameExists) {
	      throw new ConflictException('Location with given name already exists');
	    }
		if(locationDto.userId == undefined || locationDto.userId == null){
			throw new BadRequestException('Location with given name already exists');
		}
		const userId = locationDto.userId;
		const owner = await this.repoUser.findOne({where: {id: userId}});
		let ownerErrMsg = '';
		if(owner){
			const locationOwnerExists = await this.repo.find({where:{id: Not(locationId), owner}});
			if(locationOwnerExists.length > 0){
				ownerErrMsg = 'Owner has been already assigned to different location';
				throw new NotAcceptableException(ownerErrMsg);
			}
		}else{
			ownerErrMsg = 'Invalid owner';
			throw new NotAcceptableException(ownerErrMsg);
		}
	    delete locationDto.userId;
		const location = await this.repo.findOne({where: {id: locationId}, relations: {owner: true}});
		if(!location){
			throw new NotFoundException('Location not found');
		}
		await this.repo.update(locationId,locationDto);
		if(userId){
			const user = await this.repoUser.findOne({where: {id: userId}});
			if(user){
				location.owner = user;
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