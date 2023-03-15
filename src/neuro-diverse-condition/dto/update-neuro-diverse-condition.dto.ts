import { PartialType } from '@nestjs/mapped-types';
import { CreateNeuroDiverseConditionDto } from './create-neuro-diverse-condition.dto';

export class UpdateNeuroDiverseConditionDto extends PartialType(
  CreateNeuroDiverseConditionDto,
) {}
