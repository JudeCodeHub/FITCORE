import { Module } from '@nestjs/common';
import { TrainerAvailabilityController } from './trainer-availability.controller.js';
import { TrainerAvailabilityService } from './trainer-availability.service.js';

@Module({
  controllers: [TrainerAvailabilityController],
  providers: [TrainerAvailabilityService],
  exports: [TrainerAvailabilityService],
})
export class TrainerAvailabilityModule {}
