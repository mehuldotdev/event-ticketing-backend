import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '@app/common';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    login(@Body() loginDto: { email: string; password: string }) {
        return this.authService.login(loginDto);
    }

    @Get('profile')
    getProfile(@Headers('authorization') authorization: string) {
        return this.authService.getProfile(authorization);
    }
}