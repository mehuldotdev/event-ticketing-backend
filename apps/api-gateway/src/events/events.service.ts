import { SERVICES_PORTS, SERVICES } from "@app/common";
import { HttpService } from "@nestjs/axios/dist/http.service";
import { HttpException, Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";


@Injectable()
export class EventService{
    private readonly authServiceUrl = `http://localhost:${SERVICES_PORTS[SERVICES.EVENTS_SERVICE]}`;  

    constructor(private readonly httpService: HttpService) {}

    async create(data: object, userId: string, userRole: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/events`, data, {
                    headers: {
                        'x-user-id': userId,
                        'x-user-role': userRole,
                    },
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async findAll() {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.authServiceUrl}/events`,)
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }


    async findMyEvents(userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/my-events`, {
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
    
    async findOne(id: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.authServiceUrl}/events/${id}`, {
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async update(id: string, data: object, userId: string, userRole: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.put(`${this.authServiceUrl}/events/${id}`, data, {
                    headers: {
                        'x-user-id': userId,
                        'x-user-role': userRole,
                    },
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async publish(id: string, data: object, userId: string, userRole: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/events/${id}/publish`, {
                    headers: {
                        'x-user-id': userId,
                        'x-user-role': userRole,
                    },
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async cancel(id: string, data: object, userId: string, userRole: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/events/${id}/cancel`, {
                    headers: {
                        'x-user-id': userId,
                        'x-user-role': userRole,
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
            }};

            if(err.response){
                throw new HttpException(err.response.data, err.response.status);
            }
            throw new HttpException('Internal Server Error', 503);
        }

        }