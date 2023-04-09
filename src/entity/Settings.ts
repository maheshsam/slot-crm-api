import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Persistable } from "./Persistable";

@Entity()
export class Settings{
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: "varchar", length: 255, unique: true })
	settings_key: string

	@Column({ type: "text" })
	settings_value: string

	@Column(() => Persistable, { prefix: false })
    persistable: Persistable;
}