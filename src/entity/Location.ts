import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Persistable } from "./Persistable";

@Entity()
export class Location {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    location_name: string

    @Column({nullable: true, type: 'text'})
    details: string

    @Column({nullable: true, type: 'text'})
    comments: string

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

    @OneToOne((type) => User)
    @JoinColumn()
    user: User

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

}
