import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TransformInterceptor } from './transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logger,
  });
  _initConfig(app);

  _initSwagger(app);
  const port = process.env.ENV == 'dev' ? 3000 : process.env.PORT;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

function _initConfig(app: NestExpressApplication) {
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors();
}

function _initSwagger(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('SenLife')
    .setDescription('The SenLife API description')
    .setVersion('1.0')
    .addTag('SenLife')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

bootstrap();
