import { Matches, ValidateIf } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class DayHoursDto {
  @ValidateIf((o: DayHoursDto) => o.open !== null)
  @Matches(TIME_PATTERN, { message: 'open must be "HH:mm" or null' })
  open!: string | null;

  @ValidateIf((o: DayHoursDto) => o.close !== null)
  @Matches(TIME_PATTERN, { message: 'close must be "HH:mm" or null' })
  close!: string | null;
}
