import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { Permission } from '../../entity/Permission';

@Injectable()
export class PermissionsService{
	constructor(
		@InjectRepository(Permission) private repo: Repository<Permission>
	){}

	find(){
		return this.repo.find();
	}

	findOne(id: number){
		return this.repo.findOne({ where: {id: id}});
	}

	async create(permissionDto: CreatePermissionDto) {
		const permissionNameExists = await this.repo.findOne({where:{name: permissionDto.name}});
	    if (permissionNameExists) {
	      throw new ConflictException('Permission with given name already exists');
	    }
		const permission = this.repo.create(permissionDto);

		return this.repo.save(permission);
	}

}