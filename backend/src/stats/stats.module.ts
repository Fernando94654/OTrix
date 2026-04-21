import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller.js';
import { StatsService } from './stats.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
