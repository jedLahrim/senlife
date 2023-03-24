import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AppError } from '../commons/errors/app-error';
import {
  ERR_EMAIL_ALREADY_EXIST,
  ERR_EXPIRED_CODE,
  ERR_GENERATE_FIREBASE_DYNAMIC_LINK,
  ERR_GENERATE_TOKEN,
  ERR_INCORRECT_CODE,
  ERR_INVALID_TOKEN,
  ERR_NOT_FOUND,
  ERR_NOT_FOUND_USER,
} from '../commons/errors/errors-codes';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { SocialLoginDto, SocialLoginType } from './dto/social-login.dto';
import axios from 'axios';
import { UpdateUserDto } from './dto/update-user.dto';
import { Constant } from '../commons/constant';
import { VerificationCode } from './entities/verification-code.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { UserType } from './enums/user-type.enum';
import { toMs } from 'ms-typescript';

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

  //register
  async register(dto: CreateUserDto) {
    const { email } = dto;
    const user = await this.userRepo.findOne({ where: { email: email } });
    if (user) {
      throw new ConflictException(new AppError(ERR_EMAIL_ALREADY_EXIST));
    } else {
      await this._createUser(dto);
      return this._sendActivationMail(dto.email, dto.userType);
    }
  }

  //Login
  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email } = loginUserDto;
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new InternalServerErrorException(new AppError(ERR_NOT_FOUND_USER));
    } else {
      if (user.activated == false) {
        return this._sendActivationMail(user.email, user.type);
      } else {
        return this._sendVerificationMail(user.email, user.type);
      }
    }
  }

  async _sendActivationMail(email: string, userType: UserType) {
    return this._sendEmail(
      email,
      userType,
      'Activation Mail',
      Constant.ACTIVATE_HTML,
    );
  }

  async _sendVerificationMail(email: string, userType: UserType) {
    return this._sendEmail(
      email,
      userType,
      'Verification Mail',
      Constant.VERIFY_LOGIN_HTML,
    );
  }

  async _sendEmail(
    email: string,
    userType: UserType,
    subject: string,
    html: (url: string) => string | Buffer,
  ) {
    const from = this.configService.get('SENDER_MAIL');
    const code = await this._generateEmailCode(email, userType);
    const dynamicLink = await this._createDynamicLink(code.code);
    // for testing
    return { code: code.code, shortLink: dynamicLink.shortLink };
    /*try {
      await this.mailerService.sendMail({
        to: email,
        from: from,
        subject: subject,
        html: html(dynamicLink.shortLink),
      });
    } catch (e) {
      console.log(e);
      throw new NotFoundException(new AppError(ERR_SEND_MAIL));
    }*/
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

  async _getUserWithTokens(user: User) {
    try {
      const payload = { user: user.email };

      const nowTime = new Date().getTime();
      const accessExpireAt = new Date(
        nowTime + toMs(Constant.ACCESS_EXPIRES_IN),
      );
      const accessToken = this.generateToken(
        payload,
        Constant.ACCESS_EXPIRES_IN,
      );

      const refresh = this.generateToken(payload, Constant.REFRESH_EXPIRES_IN);
      const refreshExpireAt = new Date(
        nowTime + toMs(Constant.REFRESH_EXPIRES_IN),
      );

      user.access = accessToken;
      user.accessExpireAt = accessExpireAt;
      user.refresh = refresh;
      user.refreshExpireAt = refreshExpireAt;
      return user;
    } catch (e) {
      throw new NotFoundException(new AppError(ERR_GENERATE_TOKEN));
    }
  }

  async getUserById(id: string): Promise<User> {
    const found = await this.userRepo.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_USER));
    }
    return found;
  }

  private generateToken(payload: any, expiresIn: string | number): string {
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn,
      secret: this.jwtSecret,
    });
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

  private async _loginViaFacebook(facebookToken: string, userType) {
    try {
      const facebookFields = Constant.FACEBOOK_FIELDS;
      const url = Constant.FACEBOOK_URL(facebookFields, facebookToken);
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

  private async _loginViaGoogle(googleToken: string, userType) {
    try {
      const url = Constant.GOOGLE_URL(googleToken);
      const res = await axios({
        method: 'POST',
        url: url,
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

  _generateEmailCode(email, userType): Promise<VerificationCode> {
    const code = Constant.randomCodeString(6);
    const expireAt = new Date(
      new Date().getTime() + Constant.CODE_EXPIRES_IN_MILI,
    );
    const verificationCode = this.codeRepo.create({
      code: code,
      email: email,
      userType: userType,
      expireAt: expireAt,
    });
    return this.codeRepo.save(verificationCode);
  }

  private async _createDynamicLink(
    code: string,
  ): Promise<{ shortLink: string; code: string }> {
    const firebaseAPIKey = await this.configService.get('FIREBASE_WEB_API_KEY');
    const response = await axios({
      method: 'POST',
      url: Constant.FIREBASE_URL(firebaseAPIKey),
      data: {
        dynamicLinkInfo: {
          domainUriPrefix: Constant.DYNAMIC_LINK_DOMAIN_URI_PREFIX,
          link: Constant.FIREBASE_LINK(code),
          androidInfo: {
            androidPackageName: Constant.ANDROID_PACKAGE_NAME,
          },
          iosInfo: {
            iosBundleId: Constant.IOS_BUNDLE_ID,
          },
        },
      },
    }).catch(() => {
      throw new ForbiddenException(ERR_GENERATE_FIREBASE_DYNAMIC_LINK);
    });
    const shortLink = response.data.shortLink;
    return { shortLink, code };
  }

  async verifyEmail(code: string) {
    const found = await this._checkCodeValidation(code);
    const dto = new CreateUserDto(found.email, found.userType);
    let user = await this.userRepo.findOne({ where: { email: found.email } });
    if (!user) {
      user = await this._createUser(dto, true);
    }
    await this.userRepo.update({ id: user.id }, { activated: true });
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
      throw new NotFoundException(new AppError(ERR_EXPIRED_CODE));
    }
    return found;
  }

  async getUser(user: User): Promise<User> {
    return this._getUserWithTokens(user);
  }
}
