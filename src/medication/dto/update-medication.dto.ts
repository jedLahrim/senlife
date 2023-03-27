import { PartialType } from '@nestjs/swagger';
import { CreateMedicationDto } from './create-medication.dto';
import { IsString } from 'class-validator';

export class UpdateMedicationDto extends PartialType(CreateMedicationDto) {}
