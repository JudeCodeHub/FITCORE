import { Module } from '@nestjs/common';
import { PtSessionsController } from './pt-sessions.controller.js';
import { PtSessionsService } from './pt-sessions.service.js';

@Module({
  controllers: [PtSessionsController],
  providers: [PtSessionsService],
})
export class PtSessionsModule {}
