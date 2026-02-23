import { NestFactory } from '@nestjs/core';
import { TicketsServiceModule } from './tickets-service.module';
import { SERVICES, SERVICES_PORTS } from '@app/common';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(TicketsServiceModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that do not have any decorators
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
  }));

  await app.listen(SERVICES_PORTS['tickets-service']);
  console.log(`Tickets Service is running on port ${SERVICES_PORTS['tickets-service']}`);
}
bootstrap();
