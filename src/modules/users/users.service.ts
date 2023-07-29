import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException,ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { Repository, In, createQueryBuilder, Brackets, Not } from 'typeorm';
import { User } from '../../entity/User';
import { UserDetails } from '../../entity/UserDetails';
import { Role } from '../../entity/Role';
import { Permission } from '../../entity/Permission';
import { Location } from '../../entity/Location';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { GetUsersDto } from './dtos/get-users.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { MasterDataService } from '../masterdata/masterdata.service';
import { createPaginationObject, Pagination } from "../../lib/pagination";
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { KafkaProducerService } from '../../lib/kafka/producer.service';
import { hasSuperRole } from '../../lib/misc';
import * as moment from "moment";

const getmac = require('getmac')
const scrypt = promisify(_scrypt);


@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private repoUser: Repository<User>,
		@InjectRepository(UserDetails) private repoUserDetails: Repository<UserDetails>,
		@InjectRepository(Role) private repoRole: Repository<Role>,
		@InjectRepository(Permission) private repoPermission: Repository<Permission>,
		@InjectRepository(Location) private repoLocation: Repository<Location>,
		private masterDataService: MasterDataService,
		private kafkaProducerService: KafkaProducerService,
	){}

	async getUsers(args?: GetUsersDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;
		if(args.user_id && args.user_id != undefined){
			if(isSuperRole){
				return this.repoUser.find({where: {id: args.user_id}, relations: { roles: true, permissions: true, userLocation: true }});
			}else{
				return this.repoUser.find({where: {id: args.user_id, userLocation: loggedInUser.userLocation}, relations: { roles: true, permissions: true, userLocation: true }});
			}
		}
		try{
			if(Object.keys(args).length > 0){
				const usersQuery = this.repoUser.createQueryBuilder("user");
				usersQuery.leftJoinAndSelect("user.userDetails", "user_details");
				usersQuery.leftJoinAndSelect("user.roles", "role");
				usersQuery.leftJoinAndSelect("user.userLocation", "location");
				if(args.search && args.search != ""){
					usersQuery.andWhere("LOWER(user.email) LIKE LOWER(:qry) OR LOWER(user.mobile) LIKE LOWER(:qry) OR LOWER(user.full_name) LIKE LOWER(:qry) OR LOWER(user_details.first_name) LIKE LOWER(:qry) OR LOWER(user_details.middle_name) LIKE LOWER(:qry) OR LOWER(user_details.last_name) LIKE LOWER(:qry) OR LOWER(user_details.city) LIKE LOWER(:qry) OR LOWER(user_details.state) LIKE LOWER(:qry) OR LOWER(user_details.country) LIKE LOWER(:qry)", { qry: `%${args.search}%` });
				}

				if(!isSuperRole){
					usersQuery.andWhere("user.userLocationId IS NOT NULL AND user.userLocationId = :userLocationId",{userLocationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
				}
				if(args.status !== undefined && args.status !== ""){
					usersQuery.andWhere("user.is_active = :status",{status: String(args.status) == '1' ? true : false});
				}
				if(args.gender && args.gender != ""){
					const genders = args.gender.split(",");
					usersQuery.andWhere("user_details.gender IN (:gender)",{ gender: genders});
				}
				if(args.start_date && args.start_date !== null && args.end_date && args.end_date !== null){
					const startDateMoment = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ');
					const endDateMoment = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ');
					usersQuery.andWhere("user.created_at BETWEEN :startDate AND :endDate", {startDate: startDateMoment.startOf('day').toISOString(), endDate: endDateMoment.endOf('day').toISOString()});
				}
				if(args.role && args.role != ""){
					usersQuery.andWhere("role.id IN (:roles)",{ roles: args.role.split(",").map( Number )});
					// const roles = await this.repoRole.find({where: { id: In(args.role.split(",").map( Number ))}});
					// conso
					// if(roles.length > 0){
					// 	const roleIds = roles.map((item) => {
					// 		return item.id;
					// 	})
					// 	usersQuery.where("role.id IN (:roles)",{ roles: roleIds});
					// }else{
					// 	usersQuery.where("role.id = :role",{ role: 0});
					// }
				}
				
			//     // users.where(new Brackets(qb => {
			//     //     qb.where("LOWER(user.full_name) LIKE LOWER(:qry) OR LOWER(user_details.first_name) LIKE LOWER(:qry) OR LOWER(user_details.middle_name) LIKE LOWER(:qry) OR LOWER(user_details.last_name) LIKE LOWER(:qry)", { qry: `%${qry.qry}%` })
			//     //       .orWhere("user.lastName = :lastName", { lastName: "Saw" })
			//     // }))
			// "data": ,"payload":{"pagination":{"page":2,"first_page_url":"\/?page=1","from":11,"last_page":3,"links":[{"url":"\/?page=1","label":"&laquo; Previous","active":false,"page":1},{"url":"\/?page=1","label":"1","active":false,"page":1},{"url":"\/?page=2","label":"2","active":true,"page":2},{"url":"\/?page=3","label":"3","active":false,"page":3},{"url":"\/?page=3","label":"Next &raquo;","active":false,"page":3}],"next_page_url":"\/?page=3","items_per_page":"10","prev_page_url":"\/?page=1","to":20,"total":21}}
			    // return await usersQuery.skip(pageNumber).take(itemsPerPage).getMany();
				usersQuery.orderBy('user.persistable.created_at','DESC');
				const total = await usersQuery.getCount();
				const results = await usersQuery.skip((page-1)*limit).take(limit).getMany();
				// return { "data": await usersQuery.skip(pageNumber-1).take(itemsPerPage).getMany(), "payload":payload};
				return createPaginationObject<User>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return createPaginationObject<User>(await this.repoUser.find({relations: { roles: true, permissions: true }}), await this.repoUser.count(), page, limit);
		}else{
			return createPaginationObject<User>(await this.repoUser.find({where: {userLocation: loggedInUser.userLocation}, relations: { roles: true, permissions: true }}), await this.repoUser.count(), page, limit);
		}
	}

	async hashUserPassword(password: string){
		const salt = randomBytes(8).toString('hex');
		const hash = (await scrypt(password, salt, 32)) as Buffer;
		const result = salt + '.' + hash.toString('hex');
		return result;
	}

	generateUserName(email:string){
		const emailSplit = email.split('@');
		const randomChars = randomBytes(3).toString('hex');
		return `'${emailSplit[0]}-${randomChars}'`;
	}

	async publicRegister(body: RegisterUserDto){
		const password = await this.hashUserPassword(body.password);
		const { full_name, email, mobile } = body;
		const username = this.generateUserName(email);
		const userInsert: Partial<User> = {full_name,email,mobile,password,username};
		const user = this.repoUser.create(userInsert);
		return await this.repoUser.save(userInsert);
	}

	async create(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const body: CreateUserDto = args.body;
		const password = await this.hashUserPassword(body.password);
		const { email, mobile } = body;
		const userEmailExists = await this.repoUser.findOne({where:{email}});
		if (userEmailExists) {
	      throw new ConflictException('User with email already exists');
	    }

		let full_name = body.full_name! || "";
		if(full_name == undefined || full_name == ""){
			full_name = `'${body.first_name}${body.middle_name ? ' ' + body.middle_name + ' ' : ' '}${body.last_name}'`;
		}

		const username = this.generateUserName(email);

		const userInsert: Partial<User> = {full_name,email,mobile,password,username};

		const user = this.repoUser.create(userInsert);
		// console.log(args.loggedInUser);
		if(body.roles){
			const roles = await this.repoRole.find({where: {id: In(body.roles)}});
			if(roles){
				user.roles = roles;
			}
		}

		if(body.location_id){
			const location = await this.repoLocation.findOne({where: {id: body.location_id}});
			if(location){
				user.userLocation = location;
			}
		}else if(!isSuperRole){
			user.userLocation = loggedInUser.userLocation;
		}

		if(body.permissions){
			const permissions = await this.repoPermission.find({where: {id: In(body.permissions)}});
			if(permissions){
				user.permissions = permissions;
			}
		}


		if(body.first_name == undefined || body.first_name == ""){
			body.first_name = body.full_name;
		}

		const userDetails = this.repoUserDetails.create(body);

		userDetails.city = body.city;
		userDetails.state = body.state;
		userDetails.country = body.country;

		await this.repoUserDetails.save(userDetails);
		user.userDetails = userDetails;
		await this.repoUser.save(user);
		if(args.loggedInUser){
			user.persistable.created_by = args.loggedInUser;
		}
		await this.repoUser.save(user);
		// if(user){
		// 	this.kafkaProducerService.publish('user_created',{name: user.full_name, email: user.email});
		// }
		return user;
	}

	async update(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const userId: number = args.userId;
		const body: UpdateUserDto = args.body;
		const { email, mobile } = body;
		const user = await this.repoUser.findOne({where:{id:userId}});
		if(!user){
			throw new NotFoundException('User not found');
		}
		const userEmailExists = await this.repoUser.findOne({where:{email,id:Not(userId)}});
		if (userEmailExists) {
	      throw new ConflictException('User with email already exists');
	    }
		user.full_name = body.full_name;
		user.is_active = body.is_active;
		if(args.loggedInUser){
			user.persistable.updated_by = args.loggedInUser;
		}
		// await this.repoUser.save(user);
		if(body.device_lock){
			user.device_lock = body.device_lock;
			if(body.device_details && body.device_details !== ""){
				user.device_details = body.device_details;
			}else{
				user.device_details = getmac.default();
			}
		}else{
			user.device_lock = body.device_lock
		}
		if(body.password && body.password !== ""){
			if(!body.confirm_password || body.confirm_password == ""){
				throw new BadRequestException('Please enter confirm password')
			}else{
				if(body.password !== body.confirm_password){
					throw new BadRequestException('Password and Confirm password does not match')
				}
			}
		}
		if(body.password && body.password !== ""){
			const password = await this.hashUserPassword(body.password);
			user.password = password
		}
		if(email && email !== ""){
			user.email = email
		}
		if(mobile && mobile !== null){
			user.mobile = mobile
		}

		if(body.roles){
			const roles = await this.repoRole.find({where: {id: In(body.roles)}});
			if(roles){
				user.roles = roles;
			}
		}
		if(body.location_id && body.location_id !== null){
			const location = await this.repoLocation.findOne({where: {id: body.location_id}});
			if(location){
				user.userLocation = location;
			}
		}else if(!isSuperRole){
			user.userLocation = loggedInUser.userLocation;
		}

		if(body.permissions){
			const permissions = await this.repoPermission.find({where: {id: In(body.permissions)}});
			if(permissions){
				user.permissions = permissions;
			}
		}


		if(body.first_name && body.first_name == ""){
			user.userDetails.first_name = body.first_name;
		}
		if(body.last_name && body.last_name == ""){
			user.userDetails.last_name = body.last_name;
		}
		if(body.city && body.city != ""){
			user.userDetails.city = body.city;
		}
		if(body.state && body.state != ""){
			user.userDetails.state = body.state;
		}
		if(body.country && body.country != ""){
			user.userDetails.country = body.country;
		}
		
		await this.repoUser.save(user);
		return user;
	}

	async delete(userId: number) {
		if(userId == 1){
			throw new ForbiddenException("Not allowed to delete this user");
		}
		const user = await this.repoUser.findOne({ where: {id: userId}});
		if(!user){
			throw new NotFoundException('User not found');
		}
		return this.repoUser.remove(user);
	}
}
