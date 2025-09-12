import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service.js';
import { VerificationController } from './verification.controller.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [EmailModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}