import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/User';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TokenModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
