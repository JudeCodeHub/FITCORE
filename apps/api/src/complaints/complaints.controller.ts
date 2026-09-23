import {
  Body,
  Controller,
  Get,
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
import { ComplaintsService } from './complaints.service.js';
import { CreateComplaintDto } from './dto/create-complaint.dto.js';
import { ListComplaintsQueryDto } from './dto/list-complaints-query.dto.js';
import { UpdateComplaintDto } from './dto/update-complaint.dto.js';

@Controller('complaints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  // Any authenticated role can submit — this is a general complaint/
  // suggestion box, not staff-only like equipment maintenance tickets.
  @Post()
  create(
    @Body() dto: CreateComplaintDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.complaintsService.create(user.sub, dto);
  }

  // Must be registered before ':id' — otherwise Nest would match
  // "/complaints/me" as findOne with id="me".
  @Get('me')
  findMine(@CurrentUser() user: RequestUser) {
    return this.complaintsService.findMine(user.sub);
  }

  // The admin inbox.
  @Get()
  @Roles('ADMIN')
  findAll(@Query() query: ListComplaintsQueryDto) {
    return this.complaintsService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateComplaintDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.complaintsService.updateStatus(id, user.sub, dto);
  }
}
