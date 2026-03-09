import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    // Get all users from the database
    getAllUsers() {
        return this.prisma.user.findMany();
    }

    // Get user info and their levels played, by user ID
    getUserData(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            omit: {
                password: true,
            },
        })
    }
}
