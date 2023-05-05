import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Persistable } from "./Persistable";

export const defaultExpenseTypes = [
    {
        key: "food",
        label: "Food"
    },
    {
        key: "pay_security",
        label: "Pay Security"
    },
    {
        key: "other",
        label: "Other"
    },

];

export const defaultStartingMatchPoints = '10,20,30,40,50';

@Entity()
export class Location {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    location_name: string

    @Column()
    opening_start_time: string

    @Column({nullable: true, type: 'text'})
    details: string

    @Column({nullable: true, type: 'text'})
    comments: string

    @Column({nullable: true, type: 'text'})
    expense_types: string

    @Column({nullable: true})
    starting_match_points: string

    @Column({nullable: true})
    match_point_restrictions_hours: string

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
    owner: User

    @Column({ default: true })
    is_active: boolean

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

}
