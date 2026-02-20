import { SERVICES, SERVICES_PORTS } from '@app/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `api_gateway is running on port ${SERVICES_PORTS[SERVICES.API_GATEWAY]}`;
  }
}
