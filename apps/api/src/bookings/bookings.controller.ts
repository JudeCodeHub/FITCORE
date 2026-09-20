import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

// Staff-assisted booking only for now (front desk / admin / trainer booking
// someone in) — member self-service booking, with its own cutoff-window
// rule, is a separate checklist item built on top of this.
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TRAINER', 'FRONT_DESK')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get('class/:classId')
  findByClass(@Param('classId') classId: string) {
    return this.bookingsService.findByClass(classId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}
