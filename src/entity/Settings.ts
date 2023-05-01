import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinColumn } from 'typeorm';
import { Persistable } from './Persistable';
import { Location } from './Location';

@Entity()
export class Settings{
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: "varchar", length: 255, unique: true })
	settings_key: string

	@Column({ type: "text" })
	settings_value: string

	@ManyToMany((type) => Location)
    @JoinColumn()
    location: Location

	@Column(() => Persistable, { prefix: false })
    persistable: Persistable;
}