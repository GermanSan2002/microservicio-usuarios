import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserService } from './user.service';
import { User } from './entities/User';
import { Operation } from './entities/Operation';
import { UserController } from './user.controller';
import { Role } from '../roles/entities/Role';
import { Client } from '../client/entities/Client';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Operation, Role, Client]),
    AuthModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
