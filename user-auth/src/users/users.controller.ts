import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('signup')
  async signup(@Body() body: { username: string; password: string }) {
    const existing = await this.userService.findOne(body.username);
    if (existing) {
      return { message: 'User already exists' };
    }
    const user = await this.userService.create(body.username, body.password);
    return { message: 'User created', userId: user._id };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;  
  }
}
