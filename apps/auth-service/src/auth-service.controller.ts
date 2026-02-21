import { Body, Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { RegisterDto } from '@app/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Post('register')
  register(@Body() dto: RegisterDto ) {
    return this.authServiceService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: RegisterDto) {
    return this.authServiceService.login(dto.email, dto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile/:userId')
  getProfile(@Request() req: {user: {userId: string}}) {
    return this.authServiceService.getProfile(req.user.userId);
  }
}
