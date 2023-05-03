import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketoutsController } from './tickeouts.controller';
import { TicketoutsService } from './ticketouts.service';
import { Customer } from '../../entity/Customer';
import { User } from '../../entity/User';
import { TicketOut } from 'src/entity/TicketOut';

@Module({
	imports: [TypeOrmModule.forFeature([Customer,User,TicketOut])],
	controllers: [TicketoutsController],
	providers: [TicketoutsService]
})

export class TickeoutsModule {}