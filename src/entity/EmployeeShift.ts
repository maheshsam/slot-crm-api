import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";
import { Customer } from "./Customer";
import { Persistable } from "./Persistable";

@Entity()
export class EmployeeShift {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne((type) => User)
    @JoinColumn()
    user: User

    @Column({nullable: true, type: 'datetime'})
    start_time: string

    @Column({nullable: true, type: 'datetime'})
    end_time: string

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    starting_balance: number;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    ending_balance: number;
    
    @ManyToOne((type) => Location)
    @JoinColumn()
    location: Location

    @Column({nullable: true, type: 'text'})
    comments: string

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

}
