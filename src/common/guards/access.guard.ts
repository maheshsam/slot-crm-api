import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ACGuard<User extends any = any> implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  protected async getUser(context: ExecutionContext): Promise<User> {
    const contextType = context.getType().toString();
    switch (contextType) {
      case 'http':
        return context.switchToHttp().getRequest().user;
      default:
        throw new Error(`Unsupported context type: ${contextType}`);
    }
  }

  protected async getUserPermissions(context: ExecutionContext): Promise<string | string[]> {
    const user = await this.getUser(context);
    if (!user) throw new UnauthorizedException();
    let permissions = [];
    if(user['roles']){
      permissions = user['roles'].map( (role) => {
        return role.permissions.map((permission) => {
            return permission.name;
        })
      });
    }
    permissions = permissions.flat(1);
    permissions = permissions.filter((item,index) => permissions.indexOf(item) == index);
    return permissions;
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const checkPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    const permissions = await this.getUserPermissions(context);
    if (!checkPermissions) {
      return true;
    }

    const hasPermissions = checkPermissions.every((permission) => {
      return permissions.includes(permission);
    });
    return hasPermissions;
  }
}