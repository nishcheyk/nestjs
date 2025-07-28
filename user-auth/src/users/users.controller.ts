import { Controller, Post, Body, Get, UseGuards, Request, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { SignupDto } from './dto/signup.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    try {
      const existing = await this.userService.findOneByEmail(signupDto.email);
      if (existing) {
        throw new ConflictException('User already exists');
      }
      const user = await this.userService.create(signupDto.email, signupDto.password);
      return { message: 'User created', userId: user._id };
    } catch (error) {
     
      console.error('Signup error:', error);

      if (error instanceof ConflictException) {
        throw error; 
      }
    
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return {
      success: true,
      message: 'User profile fetched',
      data: req.user,
    };
  }
  
}
