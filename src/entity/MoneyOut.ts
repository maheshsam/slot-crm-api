import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";
import { Customer } from "./Customer";
import { Persistable } from "./Persistable";

export enum MoneyOutType {
    EXPENSES = "EXPENSES",
    BONUS = "BONUS",
}


@Entity()
export class MoneyOut {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "enum",
        enum: MoneyOutType,
        default: MoneyOutType.EXPENSES,
    })
    money_out_type: MoneyOutType

    @Column({nullable: true})
    sub_type: string

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    amount: number;

    @Column({nullable: true, type: 'text'})
    comments: string

    @ManyToOne((type) => Customer)
    @JoinColumn()
    customer: Customer

    @Column({nullable: true})
    machine_number: number

    @Column({nullable: true, type: 'datetime'})
    added_datetime: string

    @ManyToOne((type) => User)
    @JoinColumn()
    added_by: User

    @ManyToOne((type) => Location)
    @JoinColumn()
    location: Location

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

}
