import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { BodyMetricsModule } from './body-metrics/body-metrics.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { CheckInsModule } from './check-ins/check-ins.module.js';
import { ClassesModule } from './classes/classes.module.js';
import { EquipmentModule } from './equipment/equipment.module.js';
import { ExercisesModule } from './exercises/exercises.module.js';
import { MailerModule } from './mailer/mailer.module.js';
import { MaintenanceTicketsModule } from './maintenance-tickets/maintenance-tickets.module.js';
import { MembershipsModule } from './memberships/memberships.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PersonalRecordsModule } from './personal-records/personal-records.module.js';
import { PlansModule } from './plans/plans.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProgressPhotosModule } from './progress-photos/progress-photos.module.js';
import { PtSessionsModule } from './pt-sessions/pt-sessions.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { RevenueModule } from './revenue/revenue.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { TrainerAvailabilityModule } from './trainer-availability/trainer-availability.module.js';
import { TrainerProfilesModule } from './trainer-profiles/trainer-profiles.module.js';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MailerModule,
    AuthModule,
    PlansModule,
    MembershipsModule,
    ClassesModule,
    BookingsModule,
    PtSessionsModule,
    TrainerAvailabilityModule,
    CheckInsModule,
    TrainerProfilesModule,
    ExercisesModule,
    WorkoutPlansModule,
    BodyMetricsModule,
    PersonalRecordsModule,
    ProgressPhotosModule,
    EquipmentModule,
    MaintenanceTicketsModule,
    NotificationsModule,
    RevenueModule,
    ReportsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
