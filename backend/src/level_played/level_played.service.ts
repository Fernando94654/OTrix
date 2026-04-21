import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePlayDto } from './dto/create-play.dto.js';

@Injectable()
export class LevelPlayedService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreatePlayDto) {
        const level = await this.prisma.level.findUnique({ where: { id: dto.level_id } });
        if (!level) throw new NotFoundException('Level not found');
        if (level.max_score != null && dto.score > level.max_score) {
            throw new BadRequestException('Score exceeds level max');
        }

        return this.prisma.levelPlayed.create({
            data: {
                user_id: userId,
                level_id: dto.level_id,
                score: dto.score,
                attempts: dto.attempts,
                time_used: dto.time_used,
                date: new Date(),
            },
        });
    }
}
