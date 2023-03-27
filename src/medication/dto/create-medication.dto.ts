import {IsOptional, IsString} from 'class-validator';

export class CreateMedicationDto {
  @IsString({ message: 'you must put a valid name' })
  name: string;
  @IsString({ message: 'you must put a valid description' })
  description: string;
  @IsString({ message: 'you must put a valid child id' })
  @IsOptional()
  childId: string;
}
