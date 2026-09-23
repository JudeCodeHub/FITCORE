import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { DayHoursDto } from './day-hours.dto.js';

export class HoursDto {
  @ValidateNested()
  @Type(() => DayHoursDto)
  monday!: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  tuesday!: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  wednesday!: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  thursday!: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  friday!: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  saturday!: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  sunday!: DayHoursDto;
}
