import { IsString } from 'class-validator';

export class CreateImprovementNeedDto {
  @IsString()
  name: string;
}
