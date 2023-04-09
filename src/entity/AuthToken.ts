import { Entity, PrimaryGeneratedColumn, Column, Generated, ManyToOne, JoinColumn } from 'typeorm';
import { Persistable } from './Persistable';
import { User } from './User';

@Entity()
export class AuthToken{

	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne((type) => User)
	@JoinColumn()
	user: User

	@Column()
	expires_in: Date

	@Column({default:false})
	is_revoked: boolean

	@Column({default:'web'})
	guard_name: string

	@Column(() => Persistable, { prefix: false })
    persistable: Persistable;
}