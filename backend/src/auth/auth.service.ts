import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/signInDto.js';
import { SignUpDto} from './dto/signUpDto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { User, Session } from '../../generated/prisma/client.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {}

    signIn(signInDto: SignInDto) {
        // Implement login logic here
        
        return `This action logs in a user with email: ${signInDto.email}`;
    }

    async signUp(signUpDto: SignUpDto) {
        if (!signUpDto?.password) {
            throw new BadRequestException('Invalid request body: password is required');
        }

        const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
        // Verify unique email
        const existingUser = await this.prisma.user.findUnique({
            where: { email: signUpDto.email },
        });
        if (existingUser) {
            throw new BadRequestException('Email already in use');
        }
        const user = await this.prisma.user.create({
            data: {
                name: signUpDto.name,
                last_name: signUpDto.last_name,
                email: signUpDto.email,
                password: hashedPassword,
                birthday: new Date(signUpDto.birthday),
                gender: signUpDto.gender,
                admin: false,
                company_id: signUpDto.company,
            },
            select: {
                id: true,
                email: true,
                name: true,
                last_name: true,
                birthday: true,
                gender: true,
                company_id: true,
            }
        });

        const payload = { email: user.email, sub: user.id };

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });

        this.prisma.session.create({
            data: {
                user_id: user.id,
                refresh_token: refreshToken,
                refresh_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        });
        return { ...user, refresh_token: refreshToken };
    }
}
