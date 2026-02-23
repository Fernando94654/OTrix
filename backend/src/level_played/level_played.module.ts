import { Module } from '@nestjs/common';
import { LevelPlayedController } from './level_played.controller';
import { LevelPlayedService } from './level_played.service';

@Module({
  controllers: [LevelPlayedController],
  providers: [LevelPlayedService]
})
export class LevelPlayedModule {}
