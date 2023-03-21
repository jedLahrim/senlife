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
import { VerificationCode } from '../verification-code/entities/verification-code.entity';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            SES: {
              accessKeyId: configService.get('AWS_ACCESS_KEY'),
              secretAccessKey: configService.get('AWS_SECRET_KEY'),
              region: configService.get('AWS_REGION'),
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
