import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service.js';
import { VerificationController } from './verification.controller.js';

@Module({
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}