import { PartialType } from '@nestjs/mapped-types';
import { CreateImprovementNeedDto } from './create-improvement-need.dto';

export class UpdateImprovementNeedDto extends PartialType(
  CreateImprovementNeedDto,
) {}
