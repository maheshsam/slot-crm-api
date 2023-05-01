import { Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToOne, JoinColumn, ManyToMany } from 'typeorm';
import {User} from './User'

export abstract class Persistable {
  @Column({ default: false })
  is_deleted: boolean;

  @ManyToOne((type) => User)
  @JoinColumn()
  created_by: User

  @ManyToOne((type) => User)
  @JoinColumn()
  updated_by: User

  @Column({ default: 0 })
  deleted_by: number;

  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP',onUpdate: 'CURRENT_TIMESTAMP'})
  updated_at: Date;
}
