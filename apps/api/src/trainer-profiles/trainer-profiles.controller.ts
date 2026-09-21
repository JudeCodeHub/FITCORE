import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UpsertTrainerProfileDto } from './dto/upsert-trainer-profile.dto.js';
import { TrainerProfilesService } from './trainer-profiles.service.js';

@Controller('trainer-profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainerProfilesController {
  constructor(private readonly profilesService: TrainerProfilesService) {}

  @Put('me')
  @Roles('TRAINER')
  upsertMine(
    @Body() dto: UpsertTrainerProfileDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.profilesService.upsertMine(user.sub, dto);
  }

  @Get('me')
  @Roles('TRAINER')
  findMine(@CurrentUser() user: RequestUser) {
    return this.profilesService.findMine(user.sub);
  }

  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  // Must be registered before ':trainerId' — otherwise Nest would match
  // "/trainer-profiles/me" as this param.
  @Get(':trainerId')
  findByTrainer(@Param('trainerId') trainerId: string) {
    return this.profilesService.findByTrainer(trainerId);
  }
}
