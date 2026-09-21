import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto.js';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto.js';
import { WorkoutPlansService } from './workout-plans.service.js';

@Controller('workout-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutPlansController {
  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @Post()
  create(@Body() dto: CreateWorkoutPlanDto, @CurrentUser() user: RequestUser) {
    return this.workoutPlansService.create(user, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: RequestUser) {
    return this.workoutPlansService.findMine(user.sub);
  }

  @Get('member/:memberId')
  findForMember(
    @Param('memberId') memberId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workoutPlansService.findForMember(user, memberId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.workoutPlansService.findOne(user, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutPlanDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workoutPlansService.update(user, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.workoutPlansService.remove(user, id);
  }
}
