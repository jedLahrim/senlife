import { NeuroDiverseCondition } from '../../neuro-diverse-condition/entities/neuro-diverse-condition.entity';
import { ImprovementNeed } from '../../improvement-need/entities/improvement-need.entity';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Optional } from '@nestjs/common';
import { Gender } from '../../commons/enums/gender';

export class CreateChildDto {
  @IsString()
  fullName: string;
  nuroDiverseCondition: NeuroDiverseCondition;
  improvementNeeds: ImprovementNeed[];
  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsString()
  @IsOptional()
  videoIntroUrl?: string;
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  birthdayDate?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  get improvementNeedIds(): string[] {
    return this.improvementNeeds.map((value) => {
      return value.id;
    });
  }

  get nuroDiverseConditionId(): string {
    return this.nuroDiverseCondition.id;
  }
}
