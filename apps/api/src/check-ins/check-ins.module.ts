import { Module } from '@nestjs/common';
import { CheckInsController } from './check-ins.controller.js';
import { CheckInsGateway } from './check-ins.gateway.js';
import { CheckInsService } from './check-ins.service.js';

@Module({
  controllers: [CheckInsController],
  providers: [CheckInsService, CheckInsGateway],
  exports: [CheckInsService],
})
export class CheckInsModule {}
