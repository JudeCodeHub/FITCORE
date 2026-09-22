import { Module } from '@nestjs/common';
import { ReviewsModule } from '../reviews/reviews.module.js';
import { TrainerAvailabilityModule } from '../trainer-availability/trainer-availability.module.js';
import { ClassesController } from './classes.controller.js';
import { ClassesService } from './classes.service.js';

@Module({
  imports: [TrainerAvailabilityModule, ReviewsModule],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
