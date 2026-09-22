import {
  BadRequestException,
  Controller,
  Get,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { ExportFormat, ExportedFile } from './reports.service.js';
import { ReportsService } from './reports.service.js';

function assertFormat(format?: string): ExportFormat {
  if (format !== 'csv' && format !== 'pdf') {
    throw new BadRequestException('format must be "csv" or "pdf"');
  }
  return format;
}

function toFile({ buffer, contentType, filename }: ExportedFile) {
  return new StreamableFile(buffer, {
    type: contentType,
    disposition: `attachment; filename="${filename}"`,
  });
}

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('revenue')
  async exportRevenue(
    @Query('format') format: string,
    @Query('months') months?: string,
  ) {
    const file = await this.reports.buildRevenueReport(
      assertFormat(format),
      months ? Number(months) : undefined,
    );
    return toFile(file);
  }

  @Get('growth-churn')
  async exportGrowthChurn(
    @Query('format') format: string,
    @Query('months') months?: string,
  ) {
    const file = await this.reports.buildGrowthChurnReport(
      assertFormat(format),
      months ? Number(months) : undefined,
    );
    return toFile(file);
  }

  @Get('attendance')
  async exportAttendance(
    @Query('format') format: string,
    @Query('days') days?: string,
  ) {
    const file = await this.reports.buildAttendanceReport(
      assertFormat(format),
      days ? Number(days) : undefined,
    );
    return toFile(file);
  }

  @Get('peak-hours')
  async exportPeakHours(
    @Query('format') format: string,
    @Query('days') days?: string,
  ) {
    const file = await this.reports.buildPeakHoursReport(
      assertFormat(format),
      days ? Number(days) : undefined,
    );
    return toFile(file);
  }
}
