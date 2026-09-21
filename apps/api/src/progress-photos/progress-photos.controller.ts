import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateProgressPhotoDto } from './dto/create-progress-photo.dto.js';
import { RequestUploadUrlDto } from './dto/request-upload-url.dto.js';
import { ProgressPhotosService } from './progress-photos.service.js';

@Controller('progress-photos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressPhotosController {
  constructor(private readonly progressPhotosService: ProgressPhotosService) {}

  @Post('me/upload-url')
  requestUploadUrl(
    @Body() dto: RequestUploadUrlDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.progressPhotosService.createUploadUrl(user.sub, dto.contentType);
  }

  @Post('me')
  createMine(
    @Body() dto: CreateProgressPhotoDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.progressPhotosService.create(user.sub, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: RequestUser) {
    return this.progressPhotosService.findAllForUser(user.sub);
  }

  @Get('member/:memberId')
  findForMember(
    @Param('memberId') memberId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.progressPhotosService.findForMember(user, memberId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.progressPhotosService.remove(id, user);
  }
}
