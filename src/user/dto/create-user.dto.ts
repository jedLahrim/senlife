import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  fullName: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  password: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  newPassword: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  constructor(
    email: string,
    fullName: string,
    password: string,
    newPassword: string,
    profilePicture: string,
  ) {
    this.email = email;
    this.fullName = fullName;
    this.password = password;
    this.newPassword = newPassword;
    this.profilePicture = profilePicture;
  }
}
