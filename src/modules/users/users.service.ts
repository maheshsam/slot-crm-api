import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Repository, In, createQueryBuilder, Brackets } from 'typeorm';
import { User } from '../../entity/User';
import { UserDetails } from '../../entity/UserDetails';
import { Role } from '../../entity/Role';
import { Permission } from '../../entity/Permission';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUsersDto } from './dtos/get-users.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { MasterDataService } from '../masterdata/masterdata.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { KafkaProducerService } from '../../lib/kafka/producer.service';

const scrypt = promisify(_scrypt);


@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private repoUser: Repository<User>,
		@InjectRepository(UserDetails) private repoUserDetails: Repository<UserDetails>,
		@InjectRepository(Role) private repoRole: Repository<Role>,
		@InjectRepository(Permission) private repoPermission: Repository<Permission>,
		private masterDataService: MasterDataService,
		private kafkaProducerService: KafkaProducerService,
	){}

	async getUsers(args?: GetUsersDto){
		if(args.user_id && args.user_id != undefined){
			return this.repoUser.find({where: {id: args.user_id}, relations: { roles: true, permissions: true }});
		}
		try{
			if(Object.keys(args).length > 0){

				const usersQuery = this.repoUser.createQueryBuilder("user");
				usersQuery.leftJoinAndSelect("user.userDetails", "user_details");
				if(args.qry && args.qry != ""){
					usersQuery.where("LOWER(user.email) LIKE LOWER(:qry) OR LOWER(user.mobile) LIKE LOWER(:qry) OR LOWER(user.full_name) LIKE LOWER(:qry) OR LOWER(user_details.first_name) LIKE LOWER(:qry) OR LOWER(user_details.middle_name) LIKE LOWER(:qry) OR LOWER(user_details.last_name) LIKE LOWER(:qry) OR LOWER(user_details.city) LIKE LOWER(:qry) OR LOWER(user_details.state) LIKE LOWER(:qry) OR LOWER(user_details.country) LIKE LOWER(:qry)", { qry: `%${args.qry}%` });
				}
				if(args.gender && args.gender != ""){
					const genders = args.gender.split(",");
					usersQuery.where("user_details.gender IN (:gender)",{ gender: genders});
				}
				if(args.role && args.role != ""){
					const roles = await this.repoRole.find({where: { id: In(args.role.split(",").map( Number ))}});
					usersQuery.leftJoinAndSelect("user.roles", "role");
					if(roles.length > 0){
						const roleIds = roles.map((item) => {
							return item.id;
						})
						usersQuery.where("role.id IN (:roles)",{ roles: roleIds});
					}else{
						usersQuery.where("role.id = :role",{ role: 0});
					}
				}
			// console.log("sdfsdfsdf");
				
			//     // users.where(new Brackets(qb => {
			//     //     qb.where("LOWER(user.full_name) LIKE LOWER(:qry) OR LOWER(user_details.first_name) LIKE LOWER(:qry) OR LOWER(user_details.middle_name) LIKE LOWER(:qry) OR LOWER(user_details.last_name) LIKE LOWER(:qry)", { qry: `%${qry.qry}%` })
			//     //       .orWhere("user.lastName = :lastName", { lastName: "Saw" })
			//     // }))
			    return await usersQuery.getMany();
			}
		}catch(e){
			console.log(e);
		}
		return this.repoUser.find({relations: { roles: true, permissions: true }});
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

	async create(body: CreateUserDto) {
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

		if(body.roles){
			const roles = await this.repoRole.find({where: {id: In(body.roles)}});
			if(roles){
				user.roles = roles;
			}
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
		// if(user){
		// 	this.kafkaProducerService.publish('user_created',{name: user.full_name, email: user.email});
		// }
		return user;
	}
}
