import { Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm";

export abstract class Persistable {
  @Column({ default: false })
  is_deleted: boolean;

  @Column({ default: 0 })
  created_by: number;

  @Column({ default: 0 })
  updated_by: number;

  @Column({ default: 0 })
  deleted_by: number;

  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP',onUpdate: 'CURRENT_TIMESTAMP'})
  updated_at: Date;
}
