import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreatePromotionDto } from './dtos/create-promotion.dto';
import { UpdatePromotionDto } from './dtos/update-promotion.dto';
import { GetPromotionsDto } from './dtos/get-promotions.dto';
import { Customer } from '../../entity/Customer';
import { Promotion, PromotionType } from 'src/entity/Promotion';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';
import * as moment from "moment-timezone";

@Injectable()
export class PromotionsService{
	constructor(
		@InjectRepository(Promotion) private repo: Repository<Promotion>,
		@InjectRepository(Customer) private repoCustomer: Repository<Customer>,
	){}

	async find(args?: GetPromotionsDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;
		if(args.id && args.id != undefined){
			if(isSuperRole){
				return this.repo.findOne({where: {id: args.id, promotion_type: args.promotion_type}, relations: { customer: true, added_by: true }});
			}else{
				return this.repo.findOne({where: {id: args.id, promotion_type: args.promotion_type, location: loggedInUser.userLocation}, relations: { customer: true, added_by: true }});
			}
		}
		try{
			if(Object.keys(args).length > 0){
				const resultsQuery = this.repo.createQueryBuilder("promotion");
				resultsQuery.leftJoinAndSelect("promotion.customer", "customer");
				resultsQuery.leftJoinAndSelect("promotion.added_by", "user");
				resultsQuery.andWhere("promotion.promotion_type = :promotion_type",{promotion_type: args.promotion_type});
				if(!isSuperRole){
					if(hasPermission(loggedInUser, 'view_all_money_out')){
						resultsQuery.andWhere("promotion.locationId IS NOT NULL AND promotion.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
					}else{
						resultsQuery.andWhere("promotion.locationId IS NOT NULL AND promotion.locationId = :locationId AND promotion.addedById = :addedById",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0, addedById: loggedInUser.id});
					}
				}
				if(args.search && args.search != ""){
					resultsQuery.andWhere("LOWER(customer.first_name) LIKE LOWER(:qry) OR LOWER(customer.last_name) LIKE LOWER(:qry) OR customer.phone LIKE LOWER(:qry) OR customer.dob LIKE LOWER(:qry) OR customer.driving_license LIKE LOWER(:qry) OR LOWER(customer.city) LIKE LOWER(:qry) OR LOWER(customer.state) LIKE LOWER(:qry) OR LOWER(customer.country) LIKE LOWER(:qry) OR LOWER(customer.comments) LIKE LOWER(:qry) OR LOWER(promotion.prize_details) LIKE LOWER(:qry)", { qry: `%${args.search}%` });
				}
				const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
				let startDate = moment().utc();
				let startDateChicago = moment().tz('America/Chicago');
				let endDate = startDate;
				if(startDateChicago.format('YYYY-MM-DD HH:mm:ss') < openingStartTime.format('YYYY-MM-DD HH:mm:ss')){
					startDate.subtract(1, 'day');
				}
				startDate.set({
					hour:  openingStartTime.get('hour'),
					minute: openingStartTime.get('minute'),
					second: openingStartTime.get('second'),
				});
				endDate = moment(startDate).add(23,'hours').add(59, 'minutes');
				if(args.start_date && args.start_date !== null && args.end_date && args.end_date !== null){
					startDate = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ').utc();
					startDate.set({
						hour:  openingStartTime.get('hour'),
						minute: openingStartTime.get('minute'),
						second: openingStartTime.get('second'),
					});
					endDate = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ').utc().add(1,'day');
					endDate.set({
						hour:  openingStartTime.get('hour'),
						minute: openingStartTime.get('minute'),
						second: openingStartTime.get('second'),
					});
					endDate.subtract(1,'minute');
				}
				resultsQuery.andWhere("promotion.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
				resultsQuery.orderBy('promotion.persistable.created_at','DESC');
				const total = await resultsQuery.getCount();
				const results = await resultsQuery.skip((page-1)*limit).take(limit).getMany();
				return createPaginationObject<Promotion>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return createPaginationObject<Promotion>(await this.repo.find({where: {promotion_type: args.promotion_type}, relations: { customer: true, added_by: true }}), await this.repo.count(), page, limit);
		}else{
			return createPaginationObject<Promotion>(await this.repo.find({where: {promotion_type: args.promotion_type, location: loggedInUser.userLocation}, relations: { customer: true, added_by: true }}), await this.repo.count(), page, limit);
		}
	}

	async create(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordDto: CreatePromotionDto = args.body;
		if(loggedInUser.userLocation == null){
			throw new ConflictException('Invalid location');	
		}

		if(isSuperRole){
			const customerNameExists = await this.repoCustomer.findOne({where:{id: Number(recordDto.customer_id)}});
			if (!customerNameExists) {
				throw new ConflictException('Customer does not exists');
			}
		}else{
			const customerNameExists = await this.repoCustomer.findOne({where:{id: Number(recordDto.customer_id), location: loggedInUser.userLocation}});
			if (!customerNameExists) {
				throw new ConflictException('Customer does not exists');
			}
		}
		

	    if(loggedInUser && loggedInUser.id){
			const promotion = this.repo.create(recordDto);
			await this.repo.save(promotion);
			if(args.loggedInUser){
				promotion.persistable.created_by = args.loggedInUser;
			}
			const customer = await this.repoCustomer.findOne({where:{id: Number(recordDto.customer_id)}});
			promotion.customer = customer;
	    	promotion.added_by = loggedInUser;
			promotion.location = loggedInUser.userLocation;
			return this.repo.save(promotion);
		}else{
			throw new NotAcceptableException('Invalid user details');	
		}
	}

	async update(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordDto: UpdatePromotionDto = args.body;
		const id: number = args.id;
		let promotion = null
		if(isSuperRole){
			promotion = await this.repo.findOne({where: {id}, relations: {customer: true, added_by: true}});
				
		}else{
			promotion = await this.repo.findOne({where: {id, location: loggedInUser.userLocation}, relations: {customer: true, added_by: true}});
		}
		if(!promotion){
			throw new NotFoundException('Record not found');
		}
		if(loggedInUser){
			promotion.persistable.updated_by = loggedInUser;
		}
		await this.repo.update(id,recordDto);
		return promotion;
	}

	async delete(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordId: number = args.id;
		if(isSuperRole){
			const promotion = await this.repo.findOne({ where: {id: recordId}});
			if(!promotion){
				throw new NotFoundException;
			}else{
				return this.repo.remove(promotion);	
			}
		}else{
			const promotion = await this.repo.findOne({ where: {id: recordId, location: loggedInUser.userLocation}});
			if(!promotion){
				throw new NotFoundException;
			}else{
				return this.repo.remove(promotion);	
			}
		}
	}

}