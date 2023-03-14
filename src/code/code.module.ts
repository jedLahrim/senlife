import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyCode } from './entities/code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MyCode])],
  controllers: [CodeController],
  providers: [CodeService],
})
export class CodeModule {}
