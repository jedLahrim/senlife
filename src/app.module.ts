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
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { AttachmentModule } from './attachment/attachment.module';
import { MedicationModule } from './medication/medication.module';

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
        const host = configService.get('DB_HOST');
        const port = configService.get('DB_PORT');
        const username = configService.get('DB_USERNAME');
        const password = configService.get('DB_PASSWORD');
        const database = configService.get('DB');
        const env = process.env.ENV;
        const synchronize = env != 'prod';
        if (env != 'prod') {
          console.log(
            `DB_HOST=${host}\nDB_PORT=${port}\nDB_USERNAME=${username}\nDB_PASSWORD=${password}\nDB=${database}\nENV=${env}`,
          );
        }

        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
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
    AttachmentModule,
    MedicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
