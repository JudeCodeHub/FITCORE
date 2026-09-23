import { IsIn, IsOptional } from 'class-validator';
import { COMPLAINT_STATUSES } from './update-complaint.dto.js';
import { COMPLAINT_TYPES } from './create-complaint.dto.js';

export class ListComplaintsQueryDto {
  @IsOptional()
  @IsIn(COMPLAINT_STATUSES)
  status?: (typeof COMPLAINT_STATUSES)[number];

  @IsOptional()
  @IsIn(COMPLAINT_TYPES)
  type?: (typeof COMPLAINT_TYPES)[number];
}
