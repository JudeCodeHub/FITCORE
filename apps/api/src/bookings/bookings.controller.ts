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
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { SelfBookClassDto } from './dto/self-book-class.dto.js';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
  @Post('me')
  bookForSelf(@Body() dto: SelfBookClassDto, @CurrentUser() user: RequestUser) {
    return this.bookingsService.create({ classId: dto.classId, userId: user.sub });
  }

  @Get('me')
  findMine(@CurrentUser() user: RequestUser) {
    return this.bookingsService.findMine(user.sub);
  }

  @Post('me/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelMine(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.bookingsService.cancelForSelf(id, user.sub);
  }

  @Post()
  @Roles('ADMIN', 'TRAINER', 'FRONT_DESK')
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get('class/:classId')
  @Roles('ADMIN', 'TRAINER', 'FRONT_DESK')
  findByClass(@Param('classId') classId: string) {
    return this.bookingsService.findByClass(classId);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'TRAINER', 'FRONT_DESK')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}
