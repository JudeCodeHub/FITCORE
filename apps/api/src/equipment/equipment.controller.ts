import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';
import { EquipmentService } from './equipment.service.js';

@Controller('equipment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TRAINER', 'FRONT_DESK')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  findAll() {
    return this.equipmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.equipmentService.update(id, dto);
  }

  @Get(':id/maintenance-history')
  history(@Param('id') id: string) {
    return this.equipmentService.maintenanceHistory(id);
  }

  @Post(':id/maintenance-completions')
  completeMaintenance(@Param('id') id: string, @CurrentUser() user: RequestUser, @Body() dto: CompleteMaintenanceDto) {
    return this.equipmentService.completeMaintenance(id, user.sub, dto.notes);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(id);
  }
}
