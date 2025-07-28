import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('signup')
  async signup(@Body() body: { username: string; password: string }) {
    // Your existing signup logic
  }

  // Optional: keep or remove this dummy login method, as real login is in /auth/login
  @Post('login')
  async login() {
    return { message: 'Please use /auth/login for login' };
  }

  // Protected route example:
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    // req.user is set by JwtStrategy.validate()
    return req.user;
  }
}
