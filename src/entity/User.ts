import { Entity, PrimaryGeneratedColumn, Column, Generated, OneToOne, ManyToMany, OneToMany, JoinTable, JoinColumn, ManyToOne } from "typeorm";
import { Persistable } from "./Persistable";
import { UserDetails } from "./UserDetails";
import { Location } from "./Location";
import { Role } from "./Role";
import { Permission } from "./Permission";
import { AuthToken } from "./AuthToken";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    full_name: string

    @Column({unique: true})
    username: string

    @Column({unique: true})
    email: string

    @Column({nullable: true})
    mobile: number

    @Column()
    password: string

    @Column({nullable: true})
    network_refresh_token: string

    @Column({ default: true })
    is_active: boolean

    @Column({ default: false })
    device_lock: boolean

    @Column({ nullable: true, type: 'text'})
    device_details: string    

    @Column(() => Persistable, { prefix: false })
    persistable: Persistable;

    @OneToOne((type) => UserDetails)
    @JoinColumn()
    userDetails: UserDetails

    @ManyToOne((type) => Location)
    @JoinColumn()
    userLocation: Location

    @ManyToMany((type) => Role)
    @JoinTable()
    roles: Role[]

    @ManyToMany((type) => Permission)
    @JoinTable()
    permissions: Permission[]

    @OneToMany((type) => AuthToken, (authtoken) => authtoken.user)
    authTokens: AuthToken[]

}
