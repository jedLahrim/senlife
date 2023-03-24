import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { GetUser } from './get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';
import { SocialLoginDto } from './dto/social-login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.userService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<void> {
    return this.userService.login(loginUserDto);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refresh') refresh): Promise<User> {
    return this.userService.refreshToken(refresh);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getUser(@GetUser() user: User) {
    return this.userService.getUser(user);
  }

  @Patch('')
  @UseGuards(AuthGuard('jwt'))
  async update(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(user.id, updateUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('social-login')
  async socialLogin(@Body() socialLoginDto: SocialLoginDto): Promise<User> {
    return this.userService.socialLogin(socialLoginDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body('code') code: string) {
    return this.userService.verifyEmail(code);
  }
}
