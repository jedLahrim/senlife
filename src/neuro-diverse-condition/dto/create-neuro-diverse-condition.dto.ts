import { IsString } from 'class-validator';

export class CreateNeuroDiverseConditionDto {
  @IsString()
  name: string;
}
