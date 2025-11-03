import { Injectable,  } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { User } from '../user/entities/User';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../roles/entities/Role';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';

if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}
if (!refreshTokenSecret) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined in the environment variables');
}

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    generateAccessToken(userId: string, roles: Role[]): string {
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        
        console.log(roles);
        // Extraemos los nombres de los roles para incluirlos en el token
        const roleNames = roles.map(role => role.role);
        return jwt.sign({ userId, roles: roleNames }, jwtSecret, { expiresIn: '1h' });
    }


    generateRefreshToken(userId: string): string {
        if (!refreshTokenSecret) {
            throw new Error('REFRESH_TOKEN_SECRET is not defined');
        }
        return jwt.sign({ userId }, refreshTokenSecret, { expiresIn: '7d' });
    }

    verifyToken(token: string): { userId: string } {
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        try {
            const decodedToken = jwt.verify(token, jwtSecret);
            return decodedToken as { userId: string };
        } catch (err) {
            throw new Error('Invalid token');
        }
    }

    async refreshAccessToken(refreshToken: string): Promise<string> {
        try {
            const decoded = jwt.verify(refreshToken, refreshTokenSecret) as { userId: string };
    
            const user = await this.userRepository.findOne({
                where: { id: decoded.userId },
                relations: ['roles'],
            });
    
            if (!user) {
                throw new Error('User not found'); // Cambiado para lanzar un error específico
            }
    
            const roles = user.roles || [];
            return this.generateAccessToken(decoded.userId, roles);
        } catch (error) {
            if (error.message === 'User not found') {
                throw error; // Vuelve a lanzar el error específico para que el test lo capture
            }
            throw new Error('Invalid or expired refresh token');
        }
    }    
}