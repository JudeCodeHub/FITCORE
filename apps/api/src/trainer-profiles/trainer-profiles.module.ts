import { Module } from '@nestjs/common';
import { TrainerProfilesController } from './trainer-profiles.controller.js';
import { TrainerProfilesService } from './trainer-profiles.service.js';

@Module({
  controllers: [TrainerProfilesController],
  providers: [TrainerProfilesService],
})
export class TrainerProfilesModule {}
