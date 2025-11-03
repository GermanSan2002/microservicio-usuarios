import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { User } from '../user/entities/User';
import { Client } from './entities/Client';

@Module({
  imports: [TypeOrmModule.forFeature([Client, User])],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService]
})
export class ClientModule {}
