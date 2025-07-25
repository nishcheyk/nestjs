import { Injectable } from '@nestjs/common';

export interface Cat {
  name: string;
  age: number;
}

@Injectable()
export class CatsService {
  private cats: Cat[] = [];

  findAll(): Cat[] {
    return this.cats;
  }

  create(cat: Cat): Cat {
    this.cats.push(cat);
    return cat;
  }
}
