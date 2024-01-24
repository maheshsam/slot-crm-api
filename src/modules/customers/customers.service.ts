import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal, IsNull, Like } from 'typeorm';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { GetCustomersDto } from './dtos/get-customers.dto';
import { Customer } from '../../entity/Customer';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';
import * as moment from "moment";
import { MatchPoint } from 'src/entity/MatchPoint';
import { PutObjectCommand , S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomersService{
	constructor(
		private configService: ConfigService,
		@InjectRepository(Customer) private repo: Repository<Customer>,
		@InjectRepository(MatchPoint) private repoMatchPoints: Repository<MatchPoint>,
	){}

	async find(args?: GetCustomersDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = Number(args.page) || 1;
		const limit = Number(args.items_per_page) || 100000;
		if(args.customer_id && args.customer_id != undefined){
			if(isSuperRole){
				return await this.repo.findOne({where: {id: args.customer_id, location: loggedInUser.userLocation}, relations: { added_by: true }});
			}else{
				if(hasPermission(loggedInUser,'view_all_money_in')){
					return await this.repo.findOne({where: {id: args.customer_id, location: loggedInUser.userLocation}, relations: { added_by: true }});
				}else{
					return await this.repo.findOne({where: {id: args.customer_id, location: loggedInUser.userLocation, added_by: loggedInUser}, relations: { added_by: true }});
				}
			}
		}
		if(args.phone && args.phone != undefined){
			if(isSuperRole){
				return await this.repo.findOne({where: {phone: Number(args.phone), location: loggedInUser.userLocation}});
			}else{
				return await this.repo.findOne({where: {phone: args.phone, location: loggedInUser.userLocation}});
			}
		}
		if(args.from_recentmatchpoints && args.from_recentmatchpoints != undefined && args.from_recentmatchpoints == "yes"){
			const matchpointsQuery = this.repoMatchPoints.createQueryBuilder("matchpoint");
			matchpointsQuery.leftJoinAndSelect("matchpoint.added_by", "user");
			matchpointsQuery.leftJoinAndSelect("matchpoint.customer", "customer");
			matchpointsQuery.leftJoinAndSelect("matchpoint.location", "location");
			matchpointsQuery.andWhere("matchpoint.locationId IS NOT NULL AND matchpoint.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
			return await matchpointsQuery.orderBy("matchpoint.machine_assign_datetime","DESC").take(20).getMany();
		}
		try{
			if(Object.keys(args).length > 0){
				const customersQuery = this.repo.createQueryBuilder("customer");
				customersQuery.leftJoinAndSelect("customer.added_by", "user");
				// if(!isSuperRole){
					// if(hasPermission(loggedInUser,'view_all_money_in')){
						customersQuery.andWhere("customer.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
					// }else{
						// customersQuery.andWhere("customer.locationId IS NOT NULL AND customer.locationId = :locationId AND customer.addedById = :addedById",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0, addedById: Number(loggedInUser.id)});
					// }
				// }
				if(args.search && args.search != ""){
					customersQuery.andWhere("LOWER(customer.first_name) LIKE LOWER(:qry) OR LOWER(customer.last_name) LIKE LOWER(:qry) OR customer.phone LIKE LOWER(:qry) OR customer.dob LIKE LOWER(:qry) OR customer.driving_license LIKE LOWER(:qry) OR LOWER(customer.city) LIKE LOWER(:qry) OR LOWER(customer.state) LIKE LOWER(:qry) OR LOWER(customer.country) LIKE LOWER(:qry) OR LOWER(customer.comments) LIKE LOWER(:qry)", { qry: `%${args.search}%` });
				}
				if(args.phone !== undefined && args.phone !== null){
					customersQuery.andWhere("customer.phone = :phone",{phone: args.phone});
				}
				if(args.status !== undefined && args.status !== "" && args.status !== 'undefined'){
					customersQuery.andWhere("customer.is_active = :status",{status: String(args.status) == '1' ? true : false});
				}
				if(args.isVerified !== undefined && args.isVerified !== "" && args.isVerified !== 'undefined'){
					customersQuery.andWhere("customer.is_verified = :is_verified",{is_verified: String(args.isVerified) == '1' ? true : false});
				}
				if(args.start_date && args.start_date !== null && args.start_date !== '' && args.end_date && args.end_date !== null && args.end_date !== ''){
					const startDateMoment = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ');
					const endDateMoment = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ');
					console.log(startDateMoment,endDateMoment);
					customersQuery.andWhere("customer.created_at BETWEEN :startDate AND :endDate", {startDate: startDateMoment.startOf('day').toISOString(), endDate: endDateMoment.endOf('day').toISOString()});
				}
				customersQuery.orderBy('customer.persistable.created_at','DESC');
				const total = await customersQuery.getCount();
				if(args.export !== undefined && Number(args.export) == 1){
					const results = await customersQuery.getMany();
					return results;
				}else{
					const results = await customersQuery.skip((page-1)*limit).take(limit).getMany();
					return await createPaginationObject<Customer>(results, total, page, limit);
				}
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return await createPaginationObject<Customer>(await this.repo.find({where: {location: loggedInUser.userLocation}, relations: { added_by: true }}), await this.repo.count(), page, limit);
		}else{
			if(hasPermission(loggedInUser,'view_all_money_in')){
				return await createPaginationObject<Customer>(await this.repo.find({where: {location: loggedInUser.userLocation}, relations: { added_by: true }}), await this.repo.count(), page, limit);
			}else{
				return await createPaginationObject<Customer>(await this.repo.find({where: {location: loggedInUser.userLocation, added_by: loggedInUser}, relations: { added_by: true }}), await this.repo.count(), page, limit);
			}
		}
	}

	async create(args: any) {
		const loggedInUser = args.loggedInUser;
		// const isSuperRole = hasSuperRole(loggedInUser);
		const customerDto: CreateCustomerDto = args.body;
		if(loggedInUser.userLocation == null){
			throw new ConflictException('Invalid location');	
		}
		const customerNameExists = await this.repo.findOne({where:{phone: Number(customerDto.phone), location: loggedInUser.userLocation}});
	    if (customerNameExists) {
	      	throw new ConflictException('Customer with given phone already exists');
	    }else{
			const phone_otp = Math.floor(1000 + Math.random() * 9000);
			customerDto.phone_otp = phone_otp;
			if(loggedInUser && loggedInUser.id){
				customerDto.added_by = loggedInUser;
				customerDto.location = loggedInUser.userLocation;

				const s3Client = new S3Client({
					forcePathStyle: false, // Configures to use subdomain/virtual calling format.
					endpoint: "https://sfo3.digitaloceanspaces.com",
					region: "sfo3",
					credentials: {
					  accessKeyId: this.configService.get('DO_SPACES_KEY'),
					  secretAccessKey: this.configService.get('DO_SPACES_SECRET')
					}
				});

				let base64Content = customerDto.photo;
            	const buf = Buffer.from(base64Content.replace(/^data:image\/\w+;base64,/, ""), 'base64');
				
				const currTime = new Date().getTime();
				const spaceFileKey = "ezgfiles/customerphotos/"+customerDto.phone+"_"+currTime+".jpg";
				const params = {
					Bucket: "customerphotos", 
					Key: spaceFileKey, 
					Body: buf,
					ContentEncoding: 'base64',
					ContentType: 'image/jpeg',
					ACL: 'public-read'
				};
				//@ts-ignore
				const uploadPhoto = await s3Client.send(new PutObjectCommand(params));
				customerDto.photo = this.configService.get('DO_SPACES_CUSTOMER_PHOTOS_PATH') + spaceFileKey;
				
				const customer = this.repo.create(customerDto);
				await this.repo.save(customer);
				if(args.loggedInUser){
					customer.persistable.created_by = args.loggedInUser;
				}
				return this.repo.save(customer);
			}else{
				throw new NotAcceptableException('Invalid user details');	
			}
		}
	}

	async update(args: any) {
		const loggedInUser = args.loggedInUser;
		// const isSuperRole = hasSuperRole(loggedInUser);
		const customerDto: UpdateCustomerDto = args.body;
		const customerId: number = args.customerId;
		const customerNameExists = await this.repo.findOne({where:{phone: customerDto.phone, id: Not(Equal(customerId)),location: loggedInUser.userLocation}});
	    if (customerNameExists) {
	      throw new ConflictException('Customer with given phone number already exists');
	    }
	    
		const customer = await this.repo.findOne({where: {id: customerId}, relations: {added_by: true}});
		if(!customer){
			throw new NotFoundException('Customer not found');
		}
		if(loggedInUser){
			customer.persistable.updated_by = loggedInUser;
		}

		if(customerDto.photo.includes('data:image')){
			const s3Client = new S3Client({
				forcePathStyle: false, // Configures to use subdomain/virtual calling format.
				endpoint: "https://sfo3.digitaloceanspaces.com",
				region: "sfo3",
				credentials: {
				  accessKeyId: this.configService.get('DO_SPACES_KEY'),
				  secretAccessKey: this.configService.get('DO_SPACES_SECRET')
				}
			});
	
			let base64Content = customerDto.photo;
			const buf = Buffer.from(base64Content.replace(/^data:image\/\w+;base64,/, ""), 'base64');
			
			const currTime = new Date().getTime();
			const spaceFileKey = "ezgfiles/customerphotos/"+customerDto.phone+"_"+currTime+".jpg";
			const params = {
				Bucket: "customerphotos", 
				Key: spaceFileKey, 
				Body: buf,
				ContentEncoding: 'base64',
				ContentType: 'image/jpeg',
				ACL: 'public-read'
			};
			//@ts-ignore
			const uploadPhoto = await s3Client.send(new PutObjectCommand(params));
			customerDto.photo = this.configService.get('DO_SPACES_CUSTOMER_PHOTOS_PATH') + spaceFileKey;
		}

		await this.repo.update(customerId,customerDto);
		return customer;
	}

	async delete(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const customerId: number = args.customerId;
		if(isSuperRole){
			const customer = await this.repo.findOne({ where: {id: customerId}});
			if(!customer){
				throw new NotFoundException;
			}else{
				return this.repo.remove(customer);	
			}
		}else{
			const customer = await this.repo.findOne({ where: {id: customerId, location: loggedInUser.userLocation}});
			if(!customer){
				throw new NotFoundException;
			}else{
				return this.repo.remove(customer);	
			}
		}
	}

	async replacePhotos(args: any) {
		// const customers = await this.repo.find();
		// await customers.map(async (cust) => {
		// 	if(cust.photo.includes('data:image')){
		// 		const s3Client = new S3Client({
		// 			forcePathStyle: false, // Configures to use subdomain/virtual calling format.
		// 			endpoint: "https://sfo3.digitaloceanspaces.com",
		// 			region: "sfo3",
		// 			credentials: {
		// 			  accessKeyId: this.configService.get('DO_SPACES_KEY'),
		// 			  secretAccessKey: this.configService.get('DO_SPACES_SECRET')
		// 			}
		// 		});
	
		// 		let base64Content = cust.photo;
		// 		const buf = Buffer.from(base64Content.replace(/^data:image\/\w+;base64,/, ""), 'base64');
				
		// 		const currTime = new Date().getTime();
		// 		const spaceFileKey = "ezgfiles/customerphotos/"+cust.phone+"_"+currTime+".jpg";
		// 		const params = {
		// 			Bucket: "customerphotos", 
		// 			Key: spaceFileKey, 
		// 			Body: buf,
		// 			ContentEncoding: 'base64',
		// 			ContentType: 'image/jpeg',
		// 			ACL: 'public-read'
		// 		};
		// 		//@ts-ignore
		// 		const uploadPhoto = await s3Client.send(new PutObjectCommand(params));
		// 		// cust.photo = this.configService.get('DO_SPACES_CUSTOMER_PHOTOS_PATH') + spaceFileKey;
		// 		cust.photo = this.configService.get('DO_SPACES_CUSTOMER_PHOTOS_PATH') + spaceFileKey;
		// 		await this.repo.save(cust);
		// 	}
		// 	// console.log("cust photo",cust.photo);
		// });

		const matchpoints = await this.repoMatchPoints.find({where: {check_in_photo: Like("data:image%")}, take: 1000});
		// const matchpoints = await this.repoMatchPoints.find();
		await matchpoints.map(async (matchpoint) => {
			console.log("cchephoto",matchpoint.check_in_photo.substring(0,20));
			const checkinphoto = matchpoint.check_in_photo;
			if(checkinphoto.includes('data:image')){
				console.log("yes in")
				try{
					const s3Client = new S3Client({
						forcePathStyle: false, // Configures to use subdomain/virtual calling format.
						endpoint: "https://sfo3.digitaloceanspaces.com",
						region: "sfo3",
						credentials: {
						accessKeyId: this.configService.get('DO_SPACES_KEY'),
						secretAccessKey: this.configService.get('DO_SPACES_SECRET')
						}
					});
		
					let base64Content = matchpoint.check_in_photo;
					const buf = Buffer.from(base64Content.replace(/^data:image\/\w+;base64,/, ""), 'base64');
					
					const currTime = new Date().getTime();
					const spaceFileKey = "ezgfiles/matchpoint/"+matchpoint.id+"_"+currTime+".jpg";
					const params = {
						Bucket: "customerphotos", 
						Key: spaceFileKey, 
						Body: buf,
						ContentEncoding: 'base64',
						ContentType: 'image/jpeg',
						ACL: 'public-read'
					};
					//@ts-ignore
					const uploadPhoto = await s3Client.send(new PutObjectCommand(params));
					// cust.photo = this.configService.get('DO_SPACES_CUSTOMER_PHOTOS_PATH') + spaceFileKey;
					const filePath = this.configService.get('DO_SPACES_CUSTOMER_PHOTOS_PATH') + spaceFileKey;
					console.log("filePath",filePath);
					matchpoint.check_in_photo = filePath;
					await this.repoMatchPoints.save(matchpoint);
				}catch(err){
					console.log("err",err);
				}
			}
			console.log("after photo",matchpoint.check_in_photo);
		});

		return matchpoints;
	}

}