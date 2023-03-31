import { PartialType } from '@nestjs/swagger';
import { CreateAllergieDto } from './create-allergie.dto';

export class UpdateAllergieDto extends PartialType(CreateAllergieDto) {}
