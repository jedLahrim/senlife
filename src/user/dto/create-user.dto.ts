import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserType } from '../enums/user-type.enum';

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

  constructor(
    email: string,
    userType: UserType,
    firstName?: string,
    lastName?: string,
    profilePicture?: string,
  ) {
    this.email = email;
    this.userType = userType;
    this.firstName = firstName;
    this.lastName = lastName;
    this.profilePicture = profilePicture;
  }
}
