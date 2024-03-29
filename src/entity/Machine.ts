import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";
import { Persistable } from "./Persistable";

export const MachineTypes = [
    {
        key: 'firelink',
        label: 'Firelink'
    },
    {
        key: 'pot-of-gold',
        label: 'Pot O Gold'
    },
    {
        key: 'life-of-luxury',
        label: 'Life of Luxury'
    },
    {
        key: 'chinese-casino',
        label: 'Chinese Casino'
    },
    {
        key: 'fish-table',
        label: 'Fish Table'
    },
    {
        key: 'texas-keno',
        label: 'Texas Keno'
    },
    {
        key: 'other',
        label: 'Other'
    },
    {
        key: 'type_1',
        label: 'Type 1'
    },
    {
        key: 'type_2',
        label: 'Type 2'
    },
    {
        key: 'type_3',
        label: 'Type 3'
    }
];

@Entity()
export class Machine {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    machine_number: number

    @Column({nullable: true})
    machine_type: string

    @Column({nullable: true, type: 'text'})
    details: string

    @ManyToOne((type) => User)
    @JoinColumn()
    added_by: User

    @ManyToOne((type) => Location)
    @JoinColumn()
    location: Location

    @Column({ default: false })
    status: boolean

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

}
