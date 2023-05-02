import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";
import { Persistable } from "./Persistable";

@Entity()
export class Customer {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    first_name: string

    @Column()
    last_name: string

    @Column({nullable: true, type: 'text'})
    photo: string

    @Column({type: 'bigint'})
    phone: number

    @Column({ nullable: true})
    phone_otp: number

    @Column({nullable: true})
    dob: string

    @Column({nullable: true})
    driving_license: string

    @Column({nullable: true})
    address_line_1: string

    @Column({nullable: true})
    address_line_2: string

    @Column({nullable: true})
    address_line_3: string

    @Column({nullable: true})
    city: string

    @Column({nullable: true})
    state: string

    @Column({nullable: true})
    country: string

    @Column({nullable: true})
    starting_points: number

    @Column({nullable: true, type: 'text'})
    comments: string

    @Column({ default: true })
    is_active: boolean

    @Column({ default: false })
    is_verified: boolean

    @ManyToOne((type) => User)
    @JoinColumn()
    added_by: User

    @ManyToOne((type) => Location)
    @JoinColumn()
    location: Location

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

}
