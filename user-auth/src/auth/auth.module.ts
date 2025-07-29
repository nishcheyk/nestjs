import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { jwtConstants } from './constants';

import { createRateLimitMiddleware } from '../middleware/rate-limit.middleware';
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        createRateLimitMiddleware({
          windowMs: 5 * 60 * 1000,
          max: 5,
          message: 'Too many login attempts. Please try again after 5 minutes.',
        }),
      )
      .forRoutes('auth/login');
  }
}
