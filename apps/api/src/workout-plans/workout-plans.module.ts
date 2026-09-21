import { Module } from '@nestjs/common';
import { WorkoutPlansController } from './workout-plans.controller.js';
import { WorkoutPlansService } from './workout-plans.service.js';

@Module({
  controllers: [WorkoutPlansController],
  providers: [WorkoutPlansService],
})
export class WorkoutPlansModule {}
