import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { EnvVariables } from './configurations/configuration.interface';
import { SetupSwagger } from './configurations/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: { exposedHeaders: 'x-total-count' },
  });

  // Apply global pipes before starting the server
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      whitelist: true, // Set this to true to automatically remove unknown properties
      transform: true, // Set this to true to automatically transform incoming request data
    }),
  );

  // Swagger setup
  SetupSwagger(app);

  // Retrieve config service to get env variables
  const configService = app.get(ConfigService<EnvVariables>);

  // Start listening to the configured port
  await app.listen(configService.get('PORT'));

  Logger.verbose(
    `Server URL http://${configService.get('URL')}${
      configService.get('ENV') === 'development'
        ? `:${configService.get('PORT')}`
        : ''
    }`,
    'NestApplication',
  );

  Logger.verbose(
    `Api Documentation http://${configService.get('URL')}${
      configService.get('ENV') === 'development'
        ? `:${configService.get('PORT')}`
        : ''
    }/api/docs`,
    'NestApplication',
  );
}

bootstrap();
