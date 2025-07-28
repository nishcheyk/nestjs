import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // Create a new user and cache their data under two keys: id and username
  async create(username: string, password: string): Promise<User> {
    const hash = await bcrypt.hash(password, 10);
    const user = new this.userModel({ username, password: hash });
    const savedUser = await user.save();

    const userObj = savedUser.toObject();
    const cacheKeyById = `user:${userObj._id}`;
    const cacheKeyByUsername = `user:username:${userObj.username}`;

    try {
      await this.cacheManager.set(cacheKeyById, userObj, 3600);
      await this.cacheManager.set(cacheKeyByUsername, userObj, 3600);
      console.log(`Cached new user: ${cacheKeyByUsername} and ${cacheKeyById}`);
    } catch (error) {
      console.error('Cache set error:', error);
    }

    return userObj;
  }

  // Find user by username, first from cache, then DB if missing, and cache the result
  async findOne(username: string): Promise<User | null> {
    const cacheKeyByUsername = `user:username:${username}`;
    try {
      const cachedUser = await this.cacheManager.get<User>(cacheKeyByUsername);
      if (cachedUser) {
        console.log(`Cache HIT for key ${cacheKeyByUsername}`);
        return cachedUser;
      }
      console.log(`Cache MISS for key ${cacheKeyByUsername}`);
    } catch (error) {
      console.error('Cache get error:', error);
    }

    // Cache miss fallback to DB
    const user = await this.userModel.findOne({ username });
    if (user) {
      const userObj = user.toObject();
      const cacheKeyById = `user:${userObj._id}`;
      try {
        await this.cacheManager.set(cacheKeyByUsername, userObj, 3600);
        await this.cacheManager.set(cacheKeyById, userObj, 3600);
        console.log(`Cached user data with keys: ${cacheKeyByUsername}, ${cacheKeyById}`);
      } catch (error) {
        console.error('Cache set error:', error);
      }
      return userObj;
    }

    return null;
  }

  // Validate password matches
  async validateUser(username: string, password: string): Promise<boolean> {
    const user = await this.findOne(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return true;
    }
    return false;
  }

  // Invalidate both cache entries if user updates or deleted
  async invalidateCache(userId: string, username: string): Promise<void> {
    const cacheKeyById = `user:${userId}`;
    const cacheKeyByUsername = `user:username:${username}`;

    try {
      await this.cacheManager.del(cacheKeyById);
      await this.cacheManager.del(cacheKeyByUsername);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}
