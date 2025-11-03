import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { UserController } from './modules/user/user.controller';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './modules/user/entities/User';
import { Operation } from './modules/user/entities/Operation';
import { DataSourceConfig } from './database/data.source';
import { AuthService } from './modules/auth/auth.service';
import { UserService } from './modules/user/user.service';
import { TokenModule } from './modules/token/token.module';
import { Role } from './modules/roles/entities/Role';
import { RoleModule } from './modules/roles/roles.module';
import { Client } from './modules/client/entities/Client';
import { ClientModule } from './modules/client/client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que el ConfigModule esté disponible en todo el proyecto sin necesidad de importarlo en cada módulo
      envFilePath: '.env', // Especifica la ruta al archivo .env
    }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    TypeOrmModule.forFeature([User, Operation, Role, Client]),
    UserModule,
    AuthModule,
    TokenModule,
    RoleModule,
    ClientModule
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService, AuthService],
})
export class AppModule {}
