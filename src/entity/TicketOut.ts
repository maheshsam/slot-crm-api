import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";
import { Customer } from "./Customer";
import { Persistable } from "./Persistable";

@Entity()
export class TicketOut {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    ticket_out_points: number

    @Column()
    machine_number: number

    @ManyToOne((type) => Customer)
    @JoinColumn()
    customer: Customer

    @Column({nullable: true, type: 'text'})
    ticket_out_photo: string

    @ManyToOne((type) => User)
    @JoinColumn()
    added_by: User

    @ManyToOne((type) => Location)
    @JoinColumn()
    location: Location

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

}
