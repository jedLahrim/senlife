import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { GetUser } from './get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';
import { ResetUserDto } from './dto/reset-user-password.dto';
import { ChangeUserDto } from './dto/change-user-password.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User & any> {
    return await this.userService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<User & any> {
    return this.userService.login(loginUserDto);
  }

  @Post('verify-code')
  async activate(@Body('code') code: any): Promise<User & any> {
    return this.userService.activate(code);
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string, @GetUser() user: User) {
    return await this.userService.getUserById(id);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refresh') refresh): Promise<User> {
    return this.userService.refreshToken(refresh);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getUser(@GetUser() user: User) {
    return user;
  }

  @Post('send-email')
  async sendEmail(
    @Query('email') email: string,
    @GetUser() user: User,
  ): Promise<any> {
    return this.userService.sendMail(email, user);
  }

  @Post('forget-password')
  async sendRestEmail(
    @Query('email') email: string,
    @GetUser() user?: User,
  ): Promise<any> {
    return this.userService.sendResetMail(user, email);
  }

  @Post('reset-new-password')
  async reset(@Body() resetUserDto: ResetUserDto): Promise<User & any> {
    return await this.userService.reset(resetUserDto);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Body() changeUserDto: ChangeUserDto,
    @GetUser() user: User,
  ): Promise<User | any> {
    return await this.userService.changePassword(user, changeUserDto);
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
  // TODO: change Promise<User | any> to Promise<User>
  async socialLogin(
    @Body() socialLoginDto: SocialLoginDto,
  ): Promise<User | any> {
    return this.userService.socialLogin(socialLoginDto);
  }
  @Post('verify-email')
  async verifyEmail(
    @Body('email') email: string,
  ): Promise<User | any> {
    return this.userService.verifyEmail(email);
  }
  @Post('activate-email')
  async activateEmail(
      @Body('code') code: string,
  ): Promise<User | any> {
    return this.userService.activateEmail(code);
  }
}
