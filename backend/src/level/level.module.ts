import { Module } from '@nestjs/common';
import { LevelController } from './level.controller.js';
import { LevelService } from './level.service.js';

@Module({
  controllers: [LevelController],
  providers: [LevelService]
})
export class LevelModule {}
