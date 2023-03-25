import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Gender } from '../../commons/enums/gender';
import { UserType } from '../../user/enums/user-type.enum';

export class FilterChildDto {
  @IsEnum(UserType)
  @IsOptional()
  relation?: UserType;

  @IsOptional()
  skip?: number;
  @IsOptional()
  take?: number;
}
