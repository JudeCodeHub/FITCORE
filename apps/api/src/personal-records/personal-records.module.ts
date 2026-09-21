import { Module } from '@nestjs/common';
import { PersonalRecordsController } from './personal-records.controller.js';
import { PersonalRecordsService } from './personal-records.service.js';

@Module({
  controllers: [PersonalRecordsController],
  providers: [PersonalRecordsService],
})
export class PersonalRecordsModule {}
