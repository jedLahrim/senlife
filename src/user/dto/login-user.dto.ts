import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;
}
