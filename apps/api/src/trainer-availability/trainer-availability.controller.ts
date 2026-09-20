import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateAvailabilityDto } from './dto/create-availability.dto.js';
import { TrainerAvailabilityService } from './trainer-availability.service.js';

@Controller('trainer-availability')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainerAvailabilityController {
  constructor(
    private readonly availabilityService: TrainerAvailabilityService,
  ) {}

  @Post('me')
  @Roles('TRAINER')
  createMine(
    @Body() dto: CreateAvailabilityDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.availabilityService.create(user.sub, dto);
  }

  @Get('me')
  @Roles('TRAINER')
  findMine(@CurrentUser() user: RequestUser) {
    return this.availabilityService.findByTrainer(user.sub);
  }

  @Get(':trainerId')
  findByTrainer(@Param('trainerId') trainerId: string) {
    return this.availabilityService.findByTrainer(trainerId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.availabilityService.remove(id, user);
  }
}
