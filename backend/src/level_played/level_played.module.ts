import { Module } from '@nestjs/common';
import { LevelPlayedController } from './level_played.controller.js';
import { LevelPlayedService } from './level_played.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LevelPlayedController],
  providers: [LevelPlayedService],
})
export class LevelPlayedModule {}
