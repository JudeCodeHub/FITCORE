import { Module } from '@nestjs/common';
import { TrainerAvailabilityModule } from '../trainer-availability/trainer-availability.module.js';
import { PtSessionsController } from './pt-sessions.controller.js';
import { PtSessionsService } from './pt-sessions.service.js';

@Module({
  imports: [TrainerAvailabilityModule],
  controllers: [PtSessionsController],
  providers: [PtSessionsService],
})
export class PtSessionsModule {}
