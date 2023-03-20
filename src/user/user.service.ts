import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
  ERR_EXPIRED_CODE,
  ERR_GENERATE_FIREBASE_DYNAMIC_LINK,
  ERR_INCORRECT_CODE,
  ERR_INCORRECT_OLD_PASSWORD,
  ERR_INVALID_TOKEN,
  ERR_NOT_FOUND,
  ERR_NOT_FOUND_USER,
  ERR_SEND_MAIL,
} from '../commons/errors/errors-codes';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { SocialLoginDto, SocialLoginType } from './dto/social-login.dto';
import axios from 'axios';
import { UpdateUserDto } from './dto/update-user.dto';
import { Constant } from '../commons/constant';
import { VerificationCode } from '../verification-code/entities/verification-code.entity';
import { UserType } from './enums/user-type.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { VerifyEmailDto } from './dto/verify-email.dto';

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
    private mailerService: MailerService,
  ) {
    this.jwtSecret = this.configService.get('JWT_SECRET_KEY');
  }

  async register(dto: CreateUserDto) {
    const { email } = dto;
    const user = await this.userRepo.findOne({ where: { email: email } });
    if (user) {
      throw new ConflictException(new AppError(ERR_EMAIL_ALREADY_EXIST));
    } else {
      await this._createUser(dto);
      await this._sendActivationMail(dto.email);
      // await this.userRepo.update({ id: user.id }, { activated: true });
    }
  }
  async _sendActivationMail(email: string) {
    try {
      const from = this.configService.get('SENDER_MAIL');
      const code = await this._generateEmailCode(email);
      const dynamicLink = await this._createDynamicLink(code.code);
      await this.mailerService.sendMail({
        to: email,
        from: from,
        html: Constant.activateHtml(dynamicLink.shortLink),
      });
    } catch (e) {
      console.log(e);
      throw new NotFoundException(
        new AppError(ERR_SEND_MAIL, 'email not found'),
      );
    }
  }
  async _sendVerificationMail(email: string) {
    try {
      await this.userRepo.findOne({ where: { email } });
      const from = this.configService.get('SENDER_MAIL');
      const code = await this._generateEmailCode(email);
      const dynamicLink = await this._createDynamicLink(code.code);
      await this.mailerService.sendMail({
        to: email,
        from: from,
        html: Constant.verifyEmailHtml(dynamicLink.shortLink),
      });
    } catch (e) {
      console.log(e);
      throw new NotFoundException(
        new AppError(ERR_SEND_MAIL, 'email not found'),
      );
    }
  }

  async _createUser(dto: CreateUserDto, activated = false): Promise<User> {
    const { email, firstName, lastName, userType, profilePicture } = dto;
    const user = this.userRepo.create({
      email,
      firstName: firstName,
      lastName: lastName,
      type: userType,
      activated,
      profilePicture: profilePicture,
    });

    return this.userRepo.save(user);
  }

  //Login
  async login(loginUserDto: LoginUserDto): Promise<void> {
    const { email } = loginUserDto;
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new InternalServerErrorException(new AppError(ERR_NOT_FOUND_USER));
    } else {
      if (user.activated == false) {
        await this._sendActivationMail(email);
        await this.userRepo.update({ id: user.id }, { activated: true });
      } else {
        await this._sendVerificationMail(email);
      }
    }
  }

  async _getUserWithTokens(user: User) {
    try {
      const payload = { user: user.email };
      const accessExpireIn = Constant.accessExpireIn;
      const accessToken = this.generateToken(payload, accessExpireIn);
      const accessExpireAt = new Date(new Date().getTime() + accessExpireIn);

      const refreshExpireIn = Constant.refreshExpireIn;
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
    const { token, type, userType } = socialLoginDto;
    switch (type) {
      case SocialLoginType.GOOGLE:
        return await this._loginViaGoogle(token, userType);
      case SocialLoginType.FACEBOOK:
        return this._loginViaFacebook(token, userType);
    }
  }

  private async _loginViaFacebook(token: string, userType) {
    try {
      const fields = 'id,email,first_name,last_name,picture';
      const url = `https://graph.facebook.com/v12.0/me?fields=${fields}&access_token=${token}`;
      const response = await axios({ method: 'POST', url: url });
      const data = response.data;
      const dto = new CreateUserDto(
        data.email,
        data.first_name,
        data.last_name,
        userType,
        data.picture.data.url,
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

  private async _loginViaGoogle(token: string, userType) {
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
      const dto = new CreateUserDto(
        data.email,
        data.givenName,
        data.familyName,
        userType,
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
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, userType } = verifyEmailDto;
    const code = await this.codeRepo.findOne({ where: { email: email } });
    if (!code) {
      const generatedCode = await this._generateEmailCode(email);
      const dynamicLink = await this._createDynamicLink(generatedCode.code);
      return await this._activateEmail(dynamicLink.code, userType);
    } else {
      await this._checkCodeValidation(code.code);
      const dynamicLink = await this._createDynamicLink(code.code);
      return await this._activateEmail(dynamicLink.code, userType);
    }
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
  private async _createDynamicLink(
    code: string,
  ): Promise<{ shortLink: string; code: string }> {
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
    return { shortLink, code: code };
  }
  async _activateEmail(code: string, userType: UserType) {
    const found = await this._checkCodeValidation(code);
    // we take here the firstName and LastName from the name that is before the @ in the email
    // we use the substring function to take from character index 0 to @
    const name = found.email.substring(0, found.email.indexOf('@'));
    const dto = new CreateUserDto(found.email, name, name, userType, null);
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
      await this.codeRepo.delete({ id: found.id });
      throw new HttpException(
        new AppError(ERR_EXPIRED_CODE),
        HttpStatus.NOT_FOUND,
      );
    }
    return found;
  }
}
