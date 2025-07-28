import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

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

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const valid = await this.userService.validateUser(body.username, body.password);
    if (valid) {
      return { message: 'login successful' };
    }
    return { message: 'invalid credentials' };
  }
}
