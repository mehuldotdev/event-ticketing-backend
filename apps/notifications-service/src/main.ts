import { NestFactory } from '@nestjs/core';
import { NotificationsServiceModule } from './notifications-service.module';
import { Transport } from '@nestjs/microservices/enums/transport.enum';
import { KAFKA_CLIENT_ID } from '@app/kafka';
import { SERVICES_PORTS, SERVICES } from '@app/common/constants/services.constants';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsServiceModule);

  // connect kafka microservices for consuming events

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: { clientId: `${KAFKA_CLIENT_ID} -notifications` },
        brokers: [process.env.KAFKA_BROKER],
      },
      consumer: {
        groupId: `notifications-consumer-group`,
      }
  });

  await app.startAllMicroservices();

  await app.listen(SERVICES_PORTS['notification-service']);
  console.log(`Notifications Service is running on port ${SERVICES_PORTS['notification-service']}`);

  console.log('Notification Service has started')

}

bootstrap();
