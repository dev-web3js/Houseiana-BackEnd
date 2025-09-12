import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { PropertiesModule } from './modules/properties/properties.module.js';
import { BookingsModule } from './modules/bookings/bookings.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { VerificationModule } from './modules/verification/verification.module.js';
import { ReviewsModule } from './modules/reviews/reviews.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { EmailModule } from './modules/email/email.module.js';
import { TaxFormsModule } from './modules/tax-forms/tax-forms.module.js';
import { KycModule } from './modules/kyc/kyc.module.js';
import { MessagesModule } from './modules/messages/messages.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { RolesGuard } from './common/guards/roles.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    PropertiesModule,
    BookingsModule,
    UsersModule,
    UploadModule,
    VerificationModule,
    ReviewsModule,
    HealthModule,
    EmailModule,
    TaxFormsModule,
    KycModule,
    MessagesModule,
    NotificationsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
