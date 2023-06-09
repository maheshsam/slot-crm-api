import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";
import { Customer } from "./Customer";
import { Persistable } from "./Persistable";

@Entity()
export class MatchPoint {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true, type: 'text'})
    check_in_photo: string

    @Column({nullable: true, type: 'datetime'})
    check_in_datetime: string

    @Column({nullable: true})
    match_point: number

    @Column({nullable: true})
    machine_number: number

    @Column({nullable: true, type: 'datetime'})
    machine_assign_datetime: string

    @ManyToOne((type) => Customer)
    @JoinColumn()
    customer: Customer

    @ManyToOne((type) => User)
    @JoinColumn()
    added_by: User

    @ManyToOne((type) => User)
    @JoinColumn()
    current_user: User

    @ManyToOne((type) => Location)
    @JoinColumn()
    location: Location

    @Column({ default: false })
    status: boolean

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

}
