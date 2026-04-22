import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/signInDto.js';
import { SignUpDto } from './dto/signUpDto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '../../generated/prisma/client.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {}

    private signToken(user: { id: string; email: string; role: Role; name: string; last_name: string }) {
        return this.jwtService.sign(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                last_name: user.last_name,
            },
            { expiresIn: '7d' }
        );
    }

    async signIn(signInDto: SignInDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: signInDto.email },
        });
        if (!user || !(await bcrypt.compare(signInDto.password, user.password))) {
            throw new BadRequestException('Invalid email or password');
        }

        return {
            refresh_token: this.signToken(user),
            role: user.role,
            user_id: user.id,
            name: user.name,
            last_name: user.last_name,
        };
    }

    async signUp(signUpDto: SignUpDto) {
        if (!signUpDto?.password) {
            throw new BadRequestException('Invalid request body: password is required');
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email: signUpDto.email },
        });
        if (existingUser) {
            throw new BadRequestException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: signUpDto.name,
                last_name: signUpDto.last_name,
                email: signUpDto.email,
                password: hashedPassword,
                birthday: new Date(signUpDto.birthday),
                gender: signUpDto.gender,
                role: Role.USER,
                company_id: signUpDto.company,
                created_at: new Date(),
            },
        });

        const refresh_token = this.signToken(user);
        await this.prisma.session.create({
            data: {
                user_id: user.id,
                refresh_token,
                refresh_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                created_at: new Date(),
            },
        });

        return {
            refresh_token,
            role: user.role,
            user_id: user.id,
            name: user.name,
            last_name: user.last_name,
        };
    }
}
