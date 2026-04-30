import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service.js';
import { JwtAuthGuard, type JwtPayload } from '../auth/jwt-auth.guard.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@Controller()
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @Get('stats/me')
    @UseGuards(JwtAuthGuard)
    me(@Req() req: { user: JwtPayload }) {
        return this.statsService.getPlayerStats(req.user.sub);
    }

    @Get('admin/stats/summary')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    adminSummary() {
        return this.statsService.getAdminSummary();
    }

    @Post('admin/db/clean-sessions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    cleanSessions() {
        return this.statsService.cleanSessions();
    }

    @Post('admin/db/reset-level/:levelId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    resetLevel(@Param('levelId') levelId: string) {
        return this.statsService.resetLevel(Number(levelId));
    }

    @Post('admin/db/add-company')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    addCompany(@Body() body: { name?: string }) {
        return this.statsService.addCompany(body?.name ?? '');
    }
}
