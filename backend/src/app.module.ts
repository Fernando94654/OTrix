import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LevelPlayedModule } from './level_played/level_played.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { LevelModule } from './level/level.module.js';
import { AuthModule } from './auth/auth.module.js';
import { StatsModule } from './stats/stats.module.js';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 20,
    }]),
    PrismaModule,
    UsersModule,
    LevelPlayedModule,
    ClientsModule,
    SessionsModule,
    LevelModule,
    AuthModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
