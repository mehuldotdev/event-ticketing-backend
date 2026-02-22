import { NestFactory } from '@nestjs/core';
import { EventsServiceModule } from './events-service.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { SERVICES, SERVICES_PORTS } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(EventsServiceModule);

  // Enable validation globally

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that do not have any decorators
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
  }));

  await app.listen(SERVICES_PORTS[SERVICES.EVENTS_SERVICE]);
}
bootstrap();
