import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 3600,
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/nesttest'),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
