import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LevelPlayedService } from './level_played.service.js';
import { CreatePlayDto } from './dto/create-play.dto.js';
import { JwtAuthGuard, type JwtPayload } from '../auth/jwt-auth.guard.js';

@Controller('level-played')
export class LevelPlayedController {
    constructor(private readonly levelPlayedService: LevelPlayedService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Req() req: { user: JwtPayload }, @Body() dto: CreatePlayDto) {
        return this.levelPlayedService.create(req.user.sub, dto);
    }
}
