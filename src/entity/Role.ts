import { Entity, Index, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Persistable } from "./Persistable";
import { User } from "./User";
import { Permission } from "./Permission";

@Entity()
@Index(["name"], { unique: true })
export class Role{

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

	@ManyToMany((type) => User, (user) => user.roles)
	users: User[]

	@ManyToMany((type) => Permission)
	@JoinTable()
	permissions: Permission[]
}