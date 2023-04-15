import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../entity/User';
import { UserDetails } from '../../entity/UserDetails';
import { MasterDataService } from '../masterdata/masterdata.service';
import { Role } from '../../entity/Role';
import { Permission } from '../../entity/Permission';
import { Location } from '../../entity/Location';
import { Settings } from '../../entity/Settings';
import { KafkaProducerModule } from '../../lib/kafka/producer.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User,UserDetails,Role,Permission,Settings,Location]),
    KafkaProducerModule
  ],
  controllers: [UsersController],
  providers: [UsersService,MasterDataService]
})
export class UsersModule {}
