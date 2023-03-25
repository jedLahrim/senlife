import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserType } from '../enums/user-type.enum';
import { SocialLoginPlatform } from './social-login.dto';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @IsOptional()
  firstName: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @IsOptional()
  lastName: string;
  @IsEnum(UserType, {
    message: 'this User type is invalid',
  })
  userType: UserType;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsEnum(SocialLoginPlatform)
  @IsOptional()
  socialLoginPlatform?: SocialLoginPlatform;

  constructor(
    email: string,
    userType: UserType,
    firstName?: string,
    lastName?: string,
    profilePicture?: string,
    socialLoginPlatform?: SocialLoginPlatform,
  ) {
    this.email = email;
    this.userType = userType;
    this.firstName = firstName;
    this.lastName = lastName;
    this.profilePicture = profilePicture;
    this.socialLoginPlatform = socialLoginPlatform;
  }
}
