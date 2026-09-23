import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto.js';
import { StaffService } from './staff.service.js';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateStaffRoleDto) {
    return this.staffService.updateRole(id, dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.staffService.deactivate(id);
  }

  @Patch(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.staffService.reactivate(id);
  }
}
