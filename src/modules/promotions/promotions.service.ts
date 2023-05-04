import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreatePromotionDto } from './dtos/create-promotion.dto';
import { UpdatePromotionDto } from './dtos/update-promotion.dto';
import { GetPromotionsDto } from './dtos/get-promotions.dto';
import { Customer } from '../../entity/Customer';
import { Promotion, PromotionType } from 'src/entity/Promotion';
import { hasSuperRole } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';

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
				const resQuery = this.repo.createQueryBuilder("promotion");
				resQuery.leftJoinAndSelect("promotion.customer", "customer");
				resQuery.leftJoinAndSelect("promotion.added_by", "user");
				resQuery.andWhere("promotion.promotion_type = :phonepromotion_type",{promotion_type: args.promotion_type});
				if(!isSuperRole){
					resQuery.andWhere("customer.locationId IS NOT NULL AND customer.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
				}
				if(args.search && args.search != ""){
					resQuery.andWhere("LOWER(customer.first_name) LIKE LOWER(:qry) OR LOWER(customer.last_name) LIKE LOWER(:qry) OR customer.phone LIKE LOWER(:qry) OR customer.dob LIKE LOWER(:qry) OR customer.driving_license LIKE LOWER(:qry) OR LOWER(customer.city) LIKE LOWER(:qry) OR LOWER(customer.state) LIKE LOWER(:qry) OR LOWER(customer.country) LIKE LOWER(:qry) OR LOWER(customer.comments) LIKE LOWER(:qry) OR LOWER(promotion.prize_details) LIKE LOWER(:qry)", { qry: `%${args.search}%` });
				}
				// if(args.phone !== undefined && args.phone !== null){
				// 	resQuery.andWhere("customer.phone = :phone",{phone: args.phone});
				// }
				// if(args.status !== undefined && args.status !== ""){
				// 	resQuery.andWhere("customer.is_active = :status",{status: String(args.status) == '1' ? true : false});
				// }
				if(args.created_daterange && args.created_daterange != ""){
					const genders = args.created_daterange.split("/");
					// customersQuery.where("user_details.gender IN (:gender)",{ gender: genders});
				}
				const total = await resQuery.getCount();
				const results = await resQuery.skip(page-1).take(limit).getMany();
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