import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { SERVICES_PORTS } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that do not have any decorators
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
  }));

  await app.listen(SERVICES_PORTS['api-gateway']);
  console.log(`API Gateway is running on port ${SERVICES_PORTS['api-gateway']}`);
}

bootstrap();
