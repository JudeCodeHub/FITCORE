import { Module } from '@nestjs/common';
import { BodyMetricsController } from './body-metrics.controller.js';
import { BodyMetricsService } from './body-metrics.service.js';

@Module({
  controllers: [BodyMetricsController],
  providers: [BodyMetricsService],
})
export class BodyMetricsModule {}
