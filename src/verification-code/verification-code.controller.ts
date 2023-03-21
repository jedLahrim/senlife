import {Controller, Get, Param} from '@nestjs/common';
import { VerificationCodeService } from './verification-code.service';

@Controller('verification-code')
export class VerificationCodeController {
  constructor(
      private readonly verificationCodeService: VerificationCodeService,
  ) {
  }
}

