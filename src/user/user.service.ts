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
  ERR_INVALID_TOKEN,
  ERR_NOT_FOUND,
  ERR_NOT_FOUND_USER,
  ERR_SEND_MAIL,
  ERR_USER_NOT_ACTIVATED,
} from '../commons/errors/errors-codes';
import { MailerService } from '@nestjs-modules/mailer';
import { MyCode } from '../code/entities/code.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetUserDto } from './dto/reset-user-password.dto';
import { ChangeUserDto } from './dto/change-user-password.dto';
import { ConfigService } from '@nestjs/config';
import { SocialLoginDto, SocialLoginType } from './dto/social-login.dto';
import axios from 'axios';
import { UpdateUserDto } from './dto/update-user.dto';
import { Constant } from '../commons/constant';
import { EmailCode } from '../email-code/entities/email-code.entity';

@Injectable()
export class UserService {
  jwtSecret: string;

  constructor(
    @InjectRepository(MyCode)
    private myCodeRepo: Repository<MyCode>,
    @InjectRepository(EmailCode)
    private codeRepo: Repository<EmailCode>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @Inject(forwardRef(() => JwtService))
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get('JWT_SECRET_KEY');
  }

  async register(dto: CreateUserDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (user) {
      throw new ConflictException(new AppError(ERR_EMAIL_ALREADY_EXIST));
    } else {
      const user = await this._createUser(dto);
      await this.sendMail(user.email, user);
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

  async sendMail(email: string, user: User): Promise<any> {
    try {
      const from = this.configService.get('SENDER_MAIL');
      const code = await this.generateCode(user);

      await this.mailerService.sendMail({
        to: user.email,
        from: from,
        subject: `Hi ${user.fullName} this is your activation code ${code.code}`,
        text:
          `Hello ${user.fullName} from eventApp ` +
          `this is your activation code ${code.code}`,
        //html: `Click <a href="${url}">here</a> to activate your account !`,
      });
    } catch (e) {
      throw new NotFoundException(new AppError(ERR_SEND_MAIL));
    }
  }

  async sendResetMail(user: User, email: string | any) {
    user = await this.userRepo.findOne({ where: { email } });

    if (user == null) {
      throw new ConflictException(
        new AppError(ERR_EMAIL_NOT_FOUND, 'email not found'),
      );
    } else {
      const code = await this.generateResetCode(user);
      console.log(code.code);
      await this.mailerService.sendMail({
        to: user.email,
        from: this.configService.get('SENDER_MAIL'),
        subject: `Hi ${user.fullName} this is your activation code ${code.code}`,
        text:
          `Hello ${user.fullName} from eventApp ` +
          `this is your activation code ${code.code}`,
        //html: `Click <a href="${url}">here</a> to activate your account !`,
      });
    }
  }

  async activate(code: any): Promise<User> {
    const now = new Date();
    const found = await this.myCodeRepo.findOne({
      where: { code: code },
      loadEagerRelations: true,
      relations: ['user'],
    });
    if (!found) {
      throw new ConflictException('code is incorrect');
    }
    const user = found.user;
    if (user.code.length > 2) {
      throw new InternalServerErrorException(
        new AppError(`ERR`, 'account already activated'),
      );
    }
    if (found.expireAt < now) {
      throw new HttpException(
        new AppError(
          ERR_EXPIRED_CODE,
          'this code is expired try to send it again',
        ),
        HttpStatus.NOT_FOUND,
      );
    } else {
      user.activated = true;
      await this.userRepo.save(user);
      return this._getUserWithTokens(user);
    }
  }

  async reset(resetUserDto: ResetUserDto) {
    const { newPassword, code } = resetUserDto;
    try {
      const now = new Date();

      const found = await this.myCodeRepo.findOne({
        where: { code: code },
        loadEagerRelations: true,
        relations: ['user'],
      });
      const user = found.user;
      if (found.expireAt < now) {
        //
        await this.myCodeRepo.delete({ id: found.id });
        return new AppError(
          ERR_EXPIRED_CODE,
          'this code is expired try to send it again',
        );
      } else {
        if (found.code == code) {
          const salt = await bcrypt.genSalt(5);
          user.password = await bcrypt.hash(newPassword, salt);
          const newUser = await this.userRepo.save(user);
          return this._getUserWithTokens(newUser);
        }
      }
    } catch (error) {
      if (error.code == undefined) {
        throw new ConflictException(
          new AppError('INCORRECT_CODE', 'code is incorrect'),
        );
      }
    }
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
      throw new NotFoundException(
        new AppError('OLD_NOT_FOUND_PASSWORD', 'old password not found'),
      );
    }
  }

  //Login
  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new InternalServerErrorException(new AppError(ERR_NOT_FOUND_USER));
    } else {
      if (user.activated === false) {
        throw new ConflictException(new AppError(ERR_USER_NOT_ACTIVATED));
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
        new AppError('USER_NOT_FOUND', 'user not found'),
      );
    }
  }
  async getUserById(id: string): Promise<User> {
    const found = await this.userRepo.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(
        new AppError('ID_NOT_FOUND', `user with id '${id}' not found`),
      );
    }
    return found;
  }

  async generateCode(user: User) {
    const code = Constant.randomCodeString(6);
    const expireAt = new Date(new Date().getTime() + 200000);
    const thisCode = this.myCodeRepo.create({
      code: code,
      expireAt: expireAt,
      user: user,
    });
    return this.myCodeRepo.save(thisCode);
  }

  async generateResetCode(user: User) {
    const code = Constant.randomCodeString(6);
    const expireAt = new Date(new Date().getTime() + 200000);
    const thisCode = this.myCodeRepo.create({
      code: code,
      expireAt: expireAt,
      user: user,
    });
    return this.myCodeRepo.save(thisCode);
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
    return await this.userRepo.find();
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
    return this._loginViaGoogle(token);
    switch (type) {
      case SocialLoginType.GOOGLE:
        return this._loginViaGoogle(token);
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

  async verifyEmail(email) {
    const code = await this._generateEmailCode(email);
    return await this._createDynamicLink(code);
  }
  _generateEmailCode(email) {
    const code = Constant.randomCodeString(6);
    const expireAt = new Date(new Date().getTime() + 200000);
    const thisCode = this.codeRepo.create({
      code: code,
      email: email,
      expireAt: expireAt,
    });
    return this.codeRepo.save(thisCode);
  }
  private async _createDynamicLink(code: EmailCode) {
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

  private async _checkCodeValidation(code: string): Promise<EmailCode> {
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
