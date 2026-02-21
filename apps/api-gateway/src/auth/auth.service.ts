import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SERVICES_PORTS } from '@app/common';

@Injectable()
export class AuthService {
    private readonly authServiceUrl = `http://localhost:${SERVICES_PORTS['auth-service']}`;

    constructor(private readonly httpService: HttpService) {}

    async register(data: { email: string; password: string; name: string }) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/auth/register`, data)
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async login(data: { email: string; password: string }) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/auth/login`, data)
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getProfile(token: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.authServiceUrl}/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.response) {
            throw new HttpException(error.response.data, error.response.status);
        }
        throw new HttpException('Internal Server Error', 503);
    }
}
