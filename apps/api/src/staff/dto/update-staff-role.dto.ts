import { IsIn } from 'class-validator';
import { STAFF_ROLES } from '../../auth/dto/invite-staff.dto.js';

export class UpdateStaffRoleDto {
  @IsIn(STAFF_ROLES)
  role!: (typeof STAFF_ROLES)[number];
}
