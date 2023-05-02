import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateCheckInDto } from './dtos/create-checkin.dto';
import { GetMatchpointsDto } from './dtos/get-matchpoints.dto';
import { AssignMachineNumber } from './dtos/assign-machine-number.dto';
import { MatchPoint } from '../../entity/MatchPoint';
import { User } from '../../entity/User';
import { Customer } from '../../entity/Customer';
import { hasSuperRole } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';
@Injectable()
export class MatchpointsService{
	constructor(
		@InjectRepository(MatchPoint) private repo: Repository<MatchPoint>,
		@InjectRepository(Customer) private repoCustomer: Repository<Customer>,
	){}

	async find(args?: GetMatchpointsDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;

		if(args.matchpoint_id && args.matchpoint_id != undefined){
			return this.repo.find({where: {id: args.matchpoint_id}, relations: { customer: true, location: true, added_by: true }});
		}
		try{
			if(Object.keys(args).length > 0){

				const matchpointsQuery = this.repo.createQueryBuilder("matchpoint");
				matchpointsQuery.leftJoinAndSelect("matchpoint.added_by", "user");
				matchpointsQuery.leftJoinAndSelect("matchpoint.customer", "customer");
				matchpointsQuery.leftJoinAndSelect("matchpoint.location", "location");
				if(args.qry && args.qry != ""){
					matchpointsQuery.where("LOWER(matchpoint.first_name) LIKE LOWER(:qry) OR LOWER(matchpoint.last_name) LIKE LOWER(:qry) OR matchpoint.phone LIKE LOWER(:qry) OR matchpoint.dob LIKE LOWER(:qry) OR matchpoint.driving_license LIKE LOWER(:qry) OR LOWER(matchpoint.city) LIKE LOWER(:qry) OR LOWER(matchpoint.state) LIKE LOWER(:qry) OR LOWER(matchpoint.country) LIKE LOWER(:qry) OR LOWER(matchpoint.comments) LIKE LOWER(:qry)", { qry: `%${args.qry}%` });
				}
				
				if(args.status != undefined){
					matchpointsQuery.where("matchpoint.status = :status",{ status: Number(args.status) == 1 ? true : false});
				}
				if(args.created_daterange && args.created_daterange != ""){
					const genders = args.created_daterange.split("/");
					// matchpointsQuery.where("user_details.gender IN (:gender)",{ gender: genders});
				}
				const total = await matchpointsQuery.getCount();
				const results = await matchpointsQuery.skip(page-1).take(limit).getMany();
				return createPaginationObject<MatchPoint>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		return this.repo.find({relations: { added_by: true }});
	}

	async checkin(args: any) {
		const loggedInUser: User = args.loggedInUser;
		const checkInDto: CreateCheckInDto = args.body;

		const customerExists = await this.repoCustomer.findOne({where:{id: checkInDto.customer_id}});
	    if (!customerExists) {
	      throw new NotFoundException('Customer with given phone not found');
	    }

	    if(loggedInUser && loggedInUser.userLocation){
	    	const matchpoint = this.repo.create({...checkInDto, check_in_datetime: String(Date.now()), added_by: loggedInUser, current_user: loggedInUser, location: loggedInUser.userLocation, customer: customerExists});
			await this.repo.save(matchpoint);
			if(loggedInUser){
				matchpoint.persistable.created_by = loggedInUser;
			}
			return this.repo.save(matchpoint);
		}else{
			throw new NotAcceptableException('Invalid location details');
		}
	}

	async delete(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const matchpointId: number = args.matchpointId;
		if(isSuperRole){
			const matchpoint = await this.repo.findOne({ where: {id: matchpointId}});
			if(!matchpoint){
				throw new NotFoundException;
			}else{
				return this.repo.delete(matchpoint);	
			}
		}else{
			const matchpoint = await this.repo.findOne({ where: {id: matchpointId, location: loggedInUser.userLocation}});
			if(!matchpoint){
				throw new NotFoundException;
			}else{
				return this.repo.delete(matchpoint);	
			}
		}
	}

	async assignMachineNumber(args: any) {
		const loggedInUser = args.loggedInUser;
		const matchpointId: number = args.matchpointId;
		const body: AssignMachineNumber = args.body;
		const customerExists = await this.repoCustomer.findOne({where:{id: body.customer_id, location: loggedInUser.userLocation}});
		if (!customerExists) {
			throw new NotFoundException('Invalid customer');
		}
		const matchpoint = await this.repo.findOne({ where: {id: matchpointId, location: loggedInUser.userLocation}});
		if(!matchpoint){
			throw new NotFoundException('Invalid location');
		}
		matchpoint.machine_number = body.machine_number;
		matchpoint.machine_assign_datetime = String(Date.now());
		
		await this.repo.save(matchpoint);
		if(loggedInUser){
			matchpoint.persistable.updated_by = loggedInUser;
		}
		return this.repo.save(matchpoint);
	}

}