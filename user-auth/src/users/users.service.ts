import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async create(username: string, password: string): Promise<User> {
    const hash = await bcrypt.hash(password, 10);
    const user = new this.userModel({ username, password: hash });
    return user.save();
  }

  async findOne(username: string): Promise<User | null> {
    return this.userModel.findOne({ username });
  }

  async validateUser(username: string, password: string): Promise<boolean> {
    const user = await this.findOne(username);
    if (user && await bcrypt.compare(password, user.password)) {
      return true;
    }
    return false;
  }
}
