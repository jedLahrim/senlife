import { Module } from '@nestjs/common';
import { MedicationService } from './medication.service';
import { MedicationController } from './medication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medication } from './entities/medication.entity';
import { Child } from '../child/entities/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medication, Child])],
  controllers: [MedicationController],
  providers: [MedicationService],
})
export class MedicationModule {}
