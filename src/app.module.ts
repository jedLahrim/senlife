import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ImprovementNeedModule } from './improvement-need/improvement-need.module';
import * as path from 'path';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { NeuroDiverseConditionModule } from './neuro-diverse-condition/neuro-diverse-condition.module';
import { UserModule } from './user/user.module';
import { ChildModule } from './child/child.module';
import { CodeModule } from './code/code.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import * as process from 'process';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        //process.env what you have in CMD
        const synchronize = process.env.ENV != 'prod';

        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB'),
          autoLoadEntities: true,
          synchronize: synchronize,
        };
      },
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      fallbacks: {
        'en-*': 'en',
        'fr-*': 'fr',
      },
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    ImprovementNeedModule,
    UserModule,
    NeuroDiverseConditionModule,
    ChildModule,
    CodeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
