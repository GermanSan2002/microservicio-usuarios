// src/user/entities/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/Role';
import { Operation } from './Operation';
import { Client } from '../../client/entities/Client'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, (client) => client.users, { nullable: false, onDelete: 'CASCADE' })
  appCliente: Client;

  @Column()
  nombre: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 'active' })
  estado: string;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => Operation, (operation) => operation.usuario)
  operations: Operation[];

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;
}
