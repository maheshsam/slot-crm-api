import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";
import { Persistable } from "./Persistable";
import { Machine } from "./Machine";

@Entity()
export class MachineReading {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true, type: 'datetime'})
    reading_datetime: string

    @Column({nullable: true})
    machine_number: number

    @Column({nullable: true})
    new_in: number

    @Column({nullable: true})
    old_in: number

    @Column({nullable: true})
    net_in: number

    @Column({nullable: true})
    new_out: number

    @Column({nullable: true})
    old_out: number

    @Column({nullable: true})
    net_out: number

    @Column({nullable: true})
    daily_hold: number

    @Column({nullable: true})
    monthly_hold: number

    @ManyToOne((type) => User)
    @JoinColumn()
    added_by: User

    @ManyToOne((type) => Location)
    @JoinColumn()
    location: Location

    @OneToOne((type) => Machine)
    @JoinColumn()
    machine: Machine

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;
}