import { Module } from '@nestjs/common';
import { LevelPlayedController } from './level_played.controller.js';
import { LevelPlayedService } from './level_played.service.js';

@Module({
  controllers: [LevelPlayedController],
  providers: [LevelPlayedService]
})
export class LevelPlayedModule {}
