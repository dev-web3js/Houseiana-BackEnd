import { Module } from '@nestjs/common';
import { TaxFormsService } from './tax-forms.service.js';
import { TaxFormsController } from './tax-forms.controller.js';

@Module({
  controllers: [TaxFormsController],
  providers: [TaxFormsService],
  exports: [TaxFormsService],
})
export class TaxFormsModule {}