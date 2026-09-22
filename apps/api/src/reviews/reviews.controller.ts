import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { ReviewsService } from './reviews.service.js';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: RequestUser) {
    return this.reviewsService.create(user.sub, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: RequestUser) {
    return this.reviewsService.findMine(user.sub);
  }

  @Get('eligible')
  findEligible(@CurrentUser() user: RequestUser) {
    return this.reviewsService.findEligible(user.sub);
  }
}
