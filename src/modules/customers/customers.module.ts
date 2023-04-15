import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer } from '../../entity/Customer';
import { User } from '../../entity/User';

@Module({
	imports: [TypeOrmModule.forFeature([Customer,User])],
	controllers: [CustomersController],
	providers: [CustomersService]
})

export class CustomersModule {}