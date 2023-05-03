import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";
import { Customer } from "./Customer";
import { Persistable } from "./Persistable";

export enum MoneyInType {
    BANK = "BANK",
    PULL = "PULL",
}


@Entity()
export class MoneyIn {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "enum",
        enum: MoneyInType,
        default: MoneyInType.BANK,
    })
    money_in_type: MoneyInType

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    amount: number;

    @Column({nullable: true, type: 'text'})
    comments: string

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
