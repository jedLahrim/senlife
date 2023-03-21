import { Module } from '@nestjs/common';
import { VerificationCodeService } from './verification-code.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './entities/verification-code.entity';
import {VerificationCodeController} from "./verification-code.controller";

@Module({
  imports: [TypeOrmModule.forFeature([VerificationCode])],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService],
})
export class VerificationCodeModule {}
