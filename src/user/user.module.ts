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
import { MyCode } from '../code/entities/code.entity';
import { jwtStrategy } from './strategy/jwt.strategy';
import { OAuth2Client } from 'google-auth-library';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: 'smtp.sendgrid.net',
            auth: {
              user: 'apikey',
              pass: configService.get('SENDGRID_API_KEY'),
            },
          },
        };
      },
    }),
    TypeOrmModule.forFeature([User, MyCode]),
    HttpModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'Jwt' }),
    JwtModule.register({
      secret: 'jedJlxSecret2023',
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    jwtStrategy,
    ConfigService,
    JwtService,
    {
      provide: OAuth2Client,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const clientId: string = configService.get('GOOGLE_CLIENT_ID');
        const clientSecret: string = configService.get('GOOGLE_CLIENT_SECRET');

        return new OAuth2Client({
          clientId,
          clientSecret,
        });
      },
    },
  ],
  exports: [UserService],
})
export class UserModule {}
