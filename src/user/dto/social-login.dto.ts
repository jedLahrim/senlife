import { IsEnum } from 'class-validator';
import { UserType } from '../enums/user-type.enum';

export enum SocialLoginType {
  GOOGLE,
  FACEBOOK,
}

export class SocialLoginDto {
  @IsEnum(SocialLoginType, {
    message: 'this social type is invalid',
  })
  type: SocialLoginType;

  token: string;

  @IsEnum(UserType, {
    message: 'this User type is invalid',
  })
  userType: UserType;
}
