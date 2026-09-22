import { Module } from '@nestjs/common';
import { TrainerAvailabilityModule } from '../trainer-availability/trainer-availability.module.js';
import { ClassesController } from './classes.controller.js';
import { ClassesService } from './classes.service.js';

@Module({
  imports: [TrainerAvailabilityModule],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
