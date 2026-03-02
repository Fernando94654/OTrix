import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { LevelPlayedModule } from './level_played/level_played.module';
import { ClientsModule } from './clients/clients.module';
import { SessionsModule } from './sessions/sessions.module';
import { LevelModule } from './level/level.module';

@Module({
  imports: [UsersModule, LevelPlayedModule, ClientsModule, SessionsModule, LevelModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
