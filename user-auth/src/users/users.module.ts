import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './user.schema';

import { createRateLimitMiddleware } from '../middleware/rate-limit.middleware';
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})

export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        createRateLimitMiddleware({
          windowMs: 5 * 60 * 1000,
          max: 5,
          message:'Too many signup attempts. Please try again after 5 minutes.',
        }),
      )
      .forRoutes('users/signup'); // Adjust the route if needed
  }
}