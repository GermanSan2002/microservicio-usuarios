import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { User } from '../user/entities/User';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CredentialsDTO } from '../user/dto/credentialsDTO';
import { TokenService } from '../token/token.service';

dotenv.config();

const saltRounds = parseInt(process.env.HASH_SALT_ROUNDS || '10', 10);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tokenService: TokenService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async login(credentialsDTO: CredentialsDTO): Promise<{ accessToken: string, refreshToken: string }> {
    const { email, password } = credentialsDTO;
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles']
    });
    if (!user) {
      throw new NotFoundException('Invalid email or password');
    }

    const isPasswordValid = await this.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid email or password');
    }

    const accessToken = this.tokenService.generateAccessToken(user.id, user.roles);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }
}
