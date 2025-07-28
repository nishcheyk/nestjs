import { Injectable, Inject, ConflictException, InternalServerErrorException } from '@nestjs/common';
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

  async create(email: string, password: string): Promise<User> {
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({ email, password: hashedPassword });
    let savedUser;
    try {
      savedUser = await newUser.save();
    } catch (error) {
      console.error('Mongoose save error:', error);
      throw new InternalServerErrorException('Error creating user');
    }

    const userObj = savedUser.toObject();

    const cacheKeyById = `user:${userObj._id}`;
    const cacheKeyByEmail = `user:email:${userObj.email}`;

    try {
      await Promise.all([
        this.cacheManager.set(cacheKeyById, userObj, 3600),
        this.cacheManager.set(cacheKeyByEmail, userObj, 3600),
      ]);
      console.log(`Cached new user: ${cacheKeyByEmail} and ${cacheKeyById}`);
    } catch {
      // cache failures ignored
    }

    return userObj;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    if (!email) return null;

    const cacheKeyByEmail = `user:email:${email}`;

    try {
      const cachedUser = await this.cacheManager.get<User>(cacheKeyByEmail);
      if (cachedUser) {
        console.log(`Cache HIT for key ${cacheKeyByEmail}`);
        return cachedUser;
      }
      console.log(`Cache MISS for key ${cacheKeyByEmail}`);
    } catch {
      // cache errors ignored
    }

    const user = await this.userModel.findOne({ email }).exec();

    if (!user) return null;

    const userObj = user.toObject();
    const cacheKeyById = `user:${userObj._id}`;

    try {
      await Promise.all([
        this.cacheManager.set(cacheKeyByEmail, userObj, 3600),
        this.cacheManager.set(cacheKeyById, userObj, 3600),
      ]);
      console.log(`Cached user data with keys: ${cacheKeyByEmail}, ${cacheKeyById}`);
    } catch {
      // cache errors ignored
    }

    return userObj;
  }

  async validateUser(email: string, password: string): Promise<boolean> {
    const user = await this.findOneByEmail(email);
    if (!user) return false;

    return bcrypt.compare(password, user.password);
  }

  async invalidateCache(userId: string, email: string): Promise<void> {
    const cacheKeyById = `user:${userId}`;
    const cacheKeyByEmail = `user:email:${email}`;

    try {
      await Promise.all([
        this.cacheManager.del(cacheKeyById),
        this.cacheManager.del(cacheKeyByEmail),
      ]);
      console.log(`Cache invalidated for keys: ${cacheKeyByEmail}, ${cacheKeyById}`);
    } catch {
      // cache invalidation errors ignored
    }
  }
}
