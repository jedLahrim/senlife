import { IsEnum, IsString } from 'class-validator';
import { NeuroDiverseConditionType } from '../enums/neuro-diverse-condition-type';

export class CreateNeuroDiverseConditionDto {
  @IsString()
  name: string;

  @IsEnum(NeuroDiverseConditionType)
  type: NeuroDiverseConditionType;
}
