import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { ClassesModule } from './classes/classes.module.js';
import { MailerModule } from './mailer/mailer.module.js';
import { MembershipsModule } from './memberships/memberships.module.js';
import { PlansModule } from './plans/plans.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PtSessionsModule } from './pt-sessions/pt-sessions.module.js';

@Module({
  imports: [
    PrismaModule,
    MailerModule,
    AuthModule,
    PlansModule,
    MembershipsModule,
    ClassesModule,
    BookingsModule,
    PtSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
