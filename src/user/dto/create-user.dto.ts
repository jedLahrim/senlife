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
  firstName: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
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
    firstName: string,
    lastName: string,
    userType: UserType,
    profilePicture: string,
  ) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.userType = userType;
    this.profilePicture = profilePicture;
  }
}
