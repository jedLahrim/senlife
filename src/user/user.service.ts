import {
  ConflictException,
  ForbiddenException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AppError } from '../commons/errors/app-error';
import { v4 as uuid } from 'uuid';
import {
  EMAIL_OR_PASSWORD_IS_INCORRECT,
  ERR_EMAIL_ALREADY_EXIST,
  ERR_EMAIL_NOT_FOUND,
  ERR_EXPIRED_CODE,
  ERR_GENERATE_FIREBASE_DYNAMIC_LINK,
  ERR_INCORRECT_CODE,
  ERR_INCORRECT_OLD_PASSWORD,
  ERR_INVALID_TOKEN,
  ERR_NOT_FOUND,
  ERR_NOT_FOUND_USER,
  ERR_SEND_MAIL,
  ERR_USER_NOT_ACTIVATED,
} from '../commons/errors/errors-codes';
import { MailerService } from '@nestjs-modules/mailer';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetUserDto } from './dto/reset-user-password.dto';
import { ChangeUserDto } from './dto/change-user-password.dto';
import { ConfigService } from '@nestjs/config';
import { SocialLoginDto, SocialLoginType } from './dto/social-login.dto';
import axios from 'axios';
import { UpdateUserDto } from './dto/update-user.dto';
import { Constant } from '../commons/constant';
import { VerificationCode } from '../verification-code/entities/verification-code.entity';
@Injectable()
export class UserService {
  jwtSecret: string;

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(VerificationCode)
    private codeRepo: Repository<VerificationCode>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get('JWT_SECRET_KEY');
  }

  async register(dto: CreateUserDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (user) {
      throw new ConflictException(new AppError(ERR_EMAIL_ALREADY_EXIST));
    } else {
      await this._createUser(dto);
    }
  }

  async _createUser(dto: CreateUserDto, activated = false): Promise<User> {
    const { email, firstName, lastName, password } = dto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepo.create({
      email,
      firstName: firstName,
      lastName: lastName,
      password: hashedPassword,
      activated,
    });

    return this.userRepo.save(user);
  }

  async changePassword(user: User, changeUserDto: ChangeUserDto) {
    const { oldPassword, newPassword } = changeUserDto;
    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      const newUser = await this.userRepo.save(user);
      return this._getUserWithTokens(newUser);
    } else {
      throw new NotFoundException(new AppError(ERR_INCORRECT_OLD_PASSWORD));
    }
  }

  //Login
  async login(loginUserDto: LoginUserDto): Promise<User> {
    const { email, password } = loginUserDto;
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new InternalServerErrorException(new AppError(ERR_NOT_FOUND_USER));
    } else {
      if (user && (await bcrypt.compare(password, user.password))) {
        return this._getUserWithTokens(user);
      } else {
        throw new UnauthorizedException(
          new AppError(EMAIL_OR_PASSWORD_IS_INCORRECT),
        );
      }
    }
  }

  async _getUserWithTokens(user: User) {
    try {
      const payload = { user: user.email };
      const accessExpireIn = 864000000;
      const accessToken = this.generateToken(payload, accessExpireIn);
      const accessExpireAt = new Date(new Date().getTime() + accessExpireIn);

      const refreshExpireIn = 172800000;
      const refresh = this.generateToken(payload, refreshExpireIn);
      const refreshExpireAt = new Date(new Date().getTime() + refreshExpireIn);

      user.access = accessToken;
      user.accessExpireAt = accessExpireAt;
      user.refresh = refresh;
      user.refreshExpireAt = refreshExpireAt;
      return user;
    } catch (e) {
      throw new NotFoundException(
        new AppError(ERR_NOT_FOUND_USER, 'user not found'),
      );
    }
  }
  async getUserById(id: string): Promise<User> {
    const found = await this.userRepo.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(
        new AppError(ERR_NOT_FOUND_USER, `user with id '${id}' not found`),
      );
    }
    return found;
  }

  private generateToken(payload: any, expiresIn: number): string {
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn,
      secret: this.jwtSecret,
    });
  }

  async saveUser(user: User): Promise<User> {
    return await this.userRepo.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { firstName, lastName, profilePicture } = updateUserDto;
    const updateResult = await this.userRepo.update(id, {
      firstName,
      lastName,
      profilePicture,
    });
    if (updateResult.affected == null || updateResult.affected == 0) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND));
    }

    const user = await this.getUserById(id);
    return this._getUserWithTokens(user);
  }

  async findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getUserByToken(token: string): Promise<User> {
    const result = this.jwtService.verify(token, {
      secret: this.jwtSecret,
    });

    if (result.user) {
      return this.userRepo.findOne({ where: { email: result.user } });
    } else {
      throw new NotFoundException(
        new AppError(ERR_NOT_FOUND_USER, 'user not exist'),
      );
    }
  }

  async refreshToken(refresh: string): Promise<User> {
    try {
      // Check if refresh is valid
      // GET USER
      const user = await this.getUserByToken(refresh);

      return this._getUserWithTokens(user);
    } catch (e) {
      throw new NotFoundException(
        new AppError(ERR_NOT_FOUND_USER, 'user not exist'),
      );
    }
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    const { token, type } = socialLoginDto;
    switch (type) {
      case SocialLoginType.GOOGLE:
        return await this._loginViaGoogle(token);
      case SocialLoginType.FACEBOOK:
        return this._loginViaFacebook(token);
    }
  }

  private _loginViaFacebook(token: string) {
    throw new NotImplementedException();
  }

  private async _loginViaGoogle(token: string) {
    try {
      /*
          result will be like this
       {
        "sub": "102321088012384578644",
        "name": "Amine LAHRIM",
        "given_name": "Amine",
        "family_name": "LAHRIM",
        "picture": "https://lh3.googleusercontent.com/a/AGNmyxaibPO-MP6enBcbllAl7kvjwyzE14hRSWc9yA1JeQ=s96-c",
        "email": "aminelahrimdev@gmail.com",
        "email_verified": true,
        "locale": "en"
       }
       */
      const res = await axios({
        method: 'POST',
        url: `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`,
      });

      const data = res.data;
      const password = this._randomPassword();
      const dto = new CreateUserDto(
        data.email,
        data.givenName,
        data.familyName,
        password,
        password,
        data.picture,
      );
      let user = await this.userRepo.findOne({ where: { email: data.email } });
      if (!user) {
        user = await this._createUser(dto, true);
      }

      return this._getUserWithTokens(user);
    } catch (e) {
      throw new NotFoundException(new AppError(ERR_INVALID_TOKEN));
    }
  }

  private _randomPassword(): string {
    return `random${uuid()}`;
  }

  async verifyEmail(email): Promise<{ shortLink: string; code: string }> {
    const code = await this._generateEmailCode(email);
    return await this._createDynamicLink(code);
  }
  _generateEmailCode(email) {
    const code = Constant.randomCodeString(6);
    const expireAt = new Date(
      new Date().getTime() + Constant.codeExpirationTime,
    );
    const thisCode = this.codeRepo.create({
      code: code,
      email: email,
      expireAt: expireAt,
    });
    return this.codeRepo.save(thisCode);
  }
  private async _createDynamicLink(code: VerificationCode) {
    const firebaseAPIKey = await this.configService.get('FIREBASE_WEB_API_KEY');
    const response = await axios({
      method: 'POST',
      url: `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${firebaseAPIKey}`,
      data: {
        dynamicLinkInfo: {
          domainUriPrefix: 'https://senlife.page.link',
          link: `https://senlife.page.link/activate?code=${code}`,
          androidInfo: {
            androidPackageName: 'com.senlife.app',
          },
          iosInfo: {
            iosBundleId: 'com.senlife.app',
          },
        },
      },
    }).catch(() => {
      throw new ForbiddenException(ERR_GENERATE_FIREBASE_DYNAMIC_LINK);
    });
    const shortLink = response.data.shortLink;
    return { shortLink, code: code.code };
  }
  async activateEmail(code: string) {
    const found = await this._checkCodeValidation(code);
    const password = this._randomPassword();
    // we take here the firstName and LastName from the name that is before the @ in the email
    // we use the substring function to take from character index 0 to @
    const name = found.email.substring(0, found.email.indexOf('@'));
    const dto = new CreateUserDto(
      found.email,
      name,
      name,
      password,
      password,
      null,
    );
    let user = await this.userRepo.findOne({ where: { email: found.email } });
    if (!user) {
      user = await this._createUser(dto, true);
    }
    return this._getUserWithTokens(user);
  }

  private async _checkCodeValidation(code: string): Promise<VerificationCode> {
    const now = new Date();
    const found = await this.codeRepo.findOne({
      where: { code: code },
    });
    if (!found) {
      throw new ConflictException(new AppError(ERR_INCORRECT_CODE));
    } else if (found.expireAt < now) {
      throw new HttpException(
        new AppError(ERR_EXPIRED_CODE),
        HttpStatus.NOT_FOUND,
      );
    }
    return found;
  }
}
