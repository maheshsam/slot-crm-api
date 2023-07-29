import { Injectable, NotFoundException, ConflictException, BadRequestException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateLocationDto } from './dtos/create-location.dto';
import { UpdateLocationDto } from './dtos/update-location.dto';
import {GetLocationsDto} from './dtos/get-locations.dto';
import { Location, defaultExpenseTypes, defaultStartingMatchPoints } from '../../entity/Location';
import { User } from '../../entity/User';
import { createPaginationObject, Pagination } from "../../lib/pagination";
import { UpdateLocationSettingsDto } from './dtos/update-location-settings.dto';
import * as moment from "moment";

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
				const resultsQuery = this.repo.createQueryBuilder("location");
				resultsQuery.leftJoinAndSelect("location.owner", "user");
				if(args.search && args.search != ""){
					resultsQuery.where("LOWER(location.location_name) LIKE LOWER(:qry) OR LOWER(location.details) LIKE LOWER(:qry) OR LOWER(location.comments) LIKE LOWER(:qry) OR LOWER(location.address_line_1) LIKE LOWER(:qry) OR LOWER(location.address_line_2) LIKE LOWER(:qry) OR LOWER(location.address_line_3) LIKE LOWER(:qry) OR LOWER(location.city) LIKE LOWER(:qry) OR LOWER(location.state) LIKE LOWER(:qry) OR LOWER(location.country) LIKE LOWER(:qry)", { qry: `%${args.search}%` });
				}
				if(args.status !== undefined && args.status !== ""){
					resultsQuery.where("location.is_active = :status",{status: String(args.status) == '1' ? true : false});
				}
				if(args.user && args.user !== null){
					const users = await this.repoUser.find({where: { id: args.user}});
					if(users.length > 0){
						const userIds = users.map((item) => {
							return item.id;
						})
						resultsQuery.where("user.id IN (:users)",{ users: userIds});
					}else{
						resultsQuery.where("user.id = :user",{ user: 0});
					}
				}
				if(args.start_date && args.start_date !== null && args.end_date && args.end_date !== null){
					const startDateMoment = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ');
					const endDateMoment = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ');
					resultsQuery.andWhere("location.created_at BETWEEN :startDate AND :endDate", {startDate: startDateMoment.startOf('day').toISOString(), endDate: endDateMoment.endOf('day').toISOString()});
				}
				resultsQuery.orderBy('location.persistable.created_at','DESC');
				const total = await resultsQuery.getCount();
				const results = await resultsQuery.skip((page-1)*limit).take(limit).getMany();
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

	async create(args: any) {
		const loggedInUser: User = args.loggedInUser;
		const locationDto: CreateLocationDto = args.body;
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
			// console.log("locationOwnerExists",locationOwnerExists);
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
		await this.repo.save(location);
		if(loggedInUser){
			location.persistable.created_by = args.loggedInUser;
		}
		location.expense_types = JSON.stringify(defaultExpenseTypes);
		location.starting_match_points = defaultStartingMatchPoints;
		await this.repo.save(location);
		owner.userLocation = location;
		await this.repoUser.save(owner);
		return location;
	}

	async update(args: any) {
		const loggedInUser: User = args.loggedInUser;
		const locationId: number = args.locationId;
		const locationDto: UpdateLocationDto = args.locationDto;

		if(locationDto.location_name !== undefined){
			const locationNameExists = await this.repo.findOne({where:{location_name: locationDto.location_name, id: Not(Equal(locationId))}});
			if (locationNameExists) {
			throw new ConflictException('Location with given name already exists');
			}
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
		if(loggedInUser){
			location.persistable.updated_by = args.loggedInUser;
		}
		await this.repo.save(location);
		owner.userLocation = location;
		await this.repoUser.save(owner);
		return location;
	}

	async updateSettings(args: any) {
		const loggedInUser: User = args.loggedInUser;
		const settingsDto: UpdateLocationSettingsDto = args.body;
		const location = await this.repo.findOne({where: {id: loggedInUser.userLocation.id}, relations: {owner: true}});
		if(!location){
			throw new NotFoundException('Invalid location details');
		}
		await this.repo.update(location.id,settingsDto);
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