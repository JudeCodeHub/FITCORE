import { Module } from '@nestjs/common';
import { ProgressPhotosController } from './progress-photos.controller.js';
import { ProgressPhotosService } from './progress-photos.service.js';

@Module({
  controllers: [ProgressPhotosController],
  providers: [ProgressPhotosService],
})
export class ProgressPhotosModule {}
