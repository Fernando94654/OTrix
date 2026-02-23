import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { LevelPlayedModule } from './level_played/level_played.module';

@Module({
  imports: [UsersModule, LevelPlayedModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
