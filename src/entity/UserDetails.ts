import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Persistable } from "./Persistable";

@Entity()
export class UserDetails {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    first_name: string

    @Column({nullable: true})
    middle_name: string

    @Column({nullable: true})
    last_name: string

    @Column({nullable: true})
    gender: string

    @Column({nullable: true})
    date_of_birth: Date

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

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

}
