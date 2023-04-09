import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Persistable } from "./Persistable";
import { User } from "./User";
import { Role } from "./Role";

@Entity()
export class Permission {

	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column({ default: false })
	is_super: boolean

	@Column({ default: 'web' })
	guard_name: string

	@Column(() => Persistable, { prefix: false })
    persistable: Persistable;

    @ManyToMany((type) => User, (user) => user.permissions)
	users: User[]

	@ManyToMany((type) => Role, (role) => role.permissions)
	roles: Role[]
    
}