import { IsEnum } from 'class-validator';

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
}
