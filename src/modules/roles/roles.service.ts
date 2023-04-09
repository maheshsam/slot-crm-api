import { Injectable } from '@nestjs/common';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { serialize } from 'class-transformer';
import { Role } from '../../entity/Role';
import { Permission } from '../../entity/Permission';
import { CreateRoleDto } from './dtos/create-role.dto';
import { AssignRolePermissionsDto } from './dtos/assign-role-permissions.dto';

@Injectable()
export class RolesService{
	constructor(
		@InjectRepository(Role) private repoRole: Repository<Role>,
		@InjectRepository(Permission) private repoPermission: Repository<Permission>,
	){}

	getRoles(roleId? : string): Promise<Role[]>{
		if(roleId){
			return this.repoRole.find({ where: { id: parseInt(roleId)}, relations: { permissions: true }});
		}
		return this.repoRole.find({ relations: { permissions: true }});
    }

	async create(roleDto: CreateRoleDto) {
		const {name, guard_name, permissions} = roleDto;
		const roleNameExists = await this.repoRole.findOne({where:{name}});
	    if (roleNameExists) {
	      throw new ConflictException('Role with given name already exists');
	    }
		const role = this.repoRole.create({name, guard_name});
		await this.repoRole.save(role);
		await this.assignPermissions(role.id,{permissions});
		return role;
	}

	async assignPermissions(id: number, assignPermissionsDto: AssignRolePermissionsDto): Promise<Role>{
		const roleId = id;
		const role = await this.repoRole.findOne({where: {id: roleId}});
	    if (!role) {
	      throw new NotFoundException('Role not found');
	    }

    	const permissionsRepos = await this.repoPermission.find({ where: {id: In(assignPermissionsDto.permissions)}});
    	role.permissions = permissionsRepos;
    	await this.repoRole.save(role);
	    return role;

	    // Promise all e.g.
		// const promises: Promise<any>[] = [];
		// for (const x of body.ReportedUsers) {
		// const user = await repoRole.findOne(x) || new User(x);
		// if (!report.ReportedUsers) {
		// report.ReportedUsers = [];
		// }

		// report.ReportedUsers.push(user);
		// promises.push(user.save())
		// }

		// await Promise.all([...promises, report.save()]);
	}

}