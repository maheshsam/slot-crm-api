import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer } from '../../entity/Customer';
import { User } from '../../entity/User';
import { MatchPoint } from 'src/entity/MatchPoint';
import { TicketOut } from 'src/entity/TicketOut';
import { Promotion } from 'src/entity/Promotion';

@Module({
	imports: [TypeOrmModule.forFeature([Customer,User,MatchPoint,TicketOut, Promotion])],
	controllers: [CustomersController],
	providers: [CustomersService]
})

export class CustomersModule {}