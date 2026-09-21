import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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

  @Get('me/members')
  @Roles('TRAINER')
  findMyMembers(@CurrentUser() user: RequestUser) {
    return this.profilesService.listMyMembers(user.sub);
  }

  @Get('me/utilization')
  @Roles('TRAINER')
  getMyUtilization(
    @CurrentUser() user: RequestUser,
    @Query('days') days?: string,
  ) {
    return this.profilesService.getUtilization(
      user.sub,
      days ? Number(days) : undefined,
    );
  }

  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  // Must be registered before ':trainerId' — otherwise Nest would match
  // "/trainer-profiles/members" as that param.
  @Get('members')
  @Roles('ADMIN')
  findAllMembers() {
    return this.profilesService.listAllMembers();
  }

  // Must be registered before ':trainerId' — otherwise Nest would match
  // "/trainer-profiles/me" as this param.
  @Get(':trainerId')
  findByTrainer(@Param('trainerId') trainerId: string) {
    return this.profilesService.findByTrainer(trainerId);
  }

  @Get(':trainerId/utilization')
  @Roles('ADMIN')
  getUtilization(
    @Param('trainerId') trainerId: string,
    @Query('days') days?: string,
  ) {
    return this.profilesService.getUtilization(
      trainerId,
      days ? Number(days) : undefined,
    );
  }

  @Put(':trainerId/members/:memberId')
  @Roles('ADMIN')
  assignMember(
    @Param('trainerId') trainerId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.profilesService.assignMember(trainerId, memberId);
  }

  @Delete(':trainerId/members/:memberId')
  @Roles('ADMIN')
  unassignMember(
    @Param('trainerId') trainerId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.profilesService.unassignMember(trainerId, memberId);
  }
}
