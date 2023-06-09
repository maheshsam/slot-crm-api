import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";
import { Customer } from "./Customer";
import { Persistable } from "./Persistable";

export enum PromotionType {
    RAFFLE = "RAFFLE",
    DRAWINGS = "DRAWINGS",
}

export enum PrizeType {
    CASH = "CASH",
    OTHER = "OTHER",
}

@Entity()
export class Promotion {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "enum",
        enum: PromotionType,
        default: PromotionType.RAFFLE,
    })
    promotion_type: PromotionType

    @Column({
        type: "enum",
        enum: PrizeType,
        default: PrizeType.CASH,
    })
    prize_type: PrizeType

    @Column()
    prize_details: string

    @ManyToOne((type) => Customer)
    @JoinColumn()
    customer: Customer

    @Column({nullable: true, type: 'text'})
    promotion_customer_photo: string

    @Column({nullable: true})
    machine_number: string

    @Column({nullable: true, type: 'text'})
    comments: string

    @ManyToOne((type) => User)
    @JoinColumn()
    added_by: User

    @ManyToOne((type) => Location)
    @JoinColumn()
    location: Location

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

}
