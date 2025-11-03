// src/client/entities/client.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/User';

@Entity()
export class Client {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => User, (user) => user.appCliente)
    users: User[]; // Relación con la entidad User
}
