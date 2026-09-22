import { Module } from '@nestjs/common';
import { ReviewsModule } from '../reviews/reviews.module.js';
import { TrainerProfilesController } from './trainer-profiles.controller.js';
import { TrainerProfilesService } from './trainer-profiles.service.js';

@Module({
  imports: [ReviewsModule],
  controllers: [TrainerProfilesController],
  providers: [TrainerProfilesService],
})
export class TrainerProfilesModule {}
