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
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateMaintenanceTicketDto } from './dto/create-maintenance-ticket.dto.js';
import { ListMaintenanceTicketsQueryDto } from './dto/list-maintenance-tickets-query.dto.js';
import { UpdateMaintenanceTicketDto } from './dto/update-maintenance-ticket.dto.js';
import { MaintenanceTicketsService } from './maintenance-tickets.service.js';

@Controller('maintenance-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TRAINER', 'FRONT_DESK')
export class MaintenanceTicketsController {
  constructor(
    private readonly maintenanceTicketsService: MaintenanceTicketsService,
  ) {}

  @Get()
  findAll(@Query() query: ListMaintenanceTicketsQueryDto) {
    return this.maintenanceTicketsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceTicketsService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateMaintenanceTicketDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.maintenanceTicketsService.create(user.sub, dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceTicketDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.maintenanceTicketsService.updateStatus(id, user.sub, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.maintenanceTicketsService.remove(id);
  }
}
