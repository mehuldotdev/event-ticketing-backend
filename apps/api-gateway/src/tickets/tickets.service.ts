import { PurchaseTicketDto, SERVICES_PORTS } from "@app/common";
import { HttpException, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class TicketsService {
    private readonly ticketsServiceUrl = `http://localhost:${SERVICES_PORTS['tickets-service']}`;

    constructor(private readonly httpService: HttpService) {}

    async purchase(data: PurchaseTicketDto, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.ticketsServiceUrl}/purchase`, data, {
                    headers: {
                        'x-user-id': userId,
                    },
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown) {
        const err = error as {
            response?: {
                data: string | object;
                status: number;
            }
        };

        if (err.response) {
            throw new HttpException(err.response.data, err.response.status);
        }
        throw new HttpException('Internal Server Error', 503);
    }

    async findOne(id: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.ticketsServiceUrl}/${id}`, {
                    headers: {
                        'x-user-id': userId,
                    },
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async cancel(id: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.ticketsServiceUrl}/${id}/cancel`, {}, {
                    headers: {
                        'x-user-id': userId,
                    },
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async checkin(ticketId: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.ticketsServiceUrl}/check-in`, { ticketId }, {
                    headers: {
                        'x-user-id': userId,
                    },
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }       
    }

    async findEventTickets(eventId: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.ticketsServiceUrl}/event/${eventId}`, {
                    headers: {
                        'x-user-id': userId,
                    },
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }
}