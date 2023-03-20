import { IsEnum, IsString } from 'class-validator';
import { UserType } from '../enums/user-type.enum';

export class VerifyEmailDto {
  @IsString()
  code: string;
  @IsEnum(UserType, {
    message: 'this User type is invalid',
  })
  userType: UserType;
}
