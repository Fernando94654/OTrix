import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
}
