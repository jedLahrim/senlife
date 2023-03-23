import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { jwtStrategy } from './strategy/jwt.strategy';
import { VerificationCode } from './entities/verification-code.entity';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get('AWS_SMTP_HOST'),
            auth: {
              user: configService.get('AWS_SMTP_USER_NAME'),
              pass: configService.get('AWS_SMTP_PASSWORD'),
            },
          },
        };
      },
    }),
    TypeOrmModule.forFeature([User, VerificationCode]),
    HttpModule,
    ConfigModule,
    PassportModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          defaultStrategy: configService.get('JWT_STRATEGY_NAME'),
        };
      },
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET_KEY'),
        };
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, jwtStrategy, ConfigService, JwtService],
  exports: [UserService],
})
export class UserModule {}
