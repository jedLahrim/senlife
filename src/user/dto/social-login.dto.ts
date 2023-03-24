import { IsEnum } from 'class-validator';
import { UserType } from '../enums/user-type.enum';

export enum SocialLoginPlatform {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
}

export class SocialLoginDto {
  @IsEnum(SocialLoginPlatform, {
    message: 'this social type is invalid',
  })
  platform: SocialLoginPlatform;

  token: string;

  @IsEnum(UserType, {
    message: 'this User type is invalid',
  })
  userType: UserType;
}
