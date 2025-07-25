import { Injectable } from '@nestjs/common';

export interface Cat {
  id: number;
  name: string;
  age: number;
}

@Injectable()
export class CatsService {
  private cats: Cat[] = [];
  private nextId = 1;

  findAll(): Cat[] {
    return this.cats;
  }

  findOne(id: number): Cat | undefined {
    return this.cats.find(cat => cat.id === id);
  }

  create(cat: Omit<Cat, 'id'>): Cat {
    const newCat = { id: this.nextId++, ...cat };
    this.cats.push(newCat);
    return newCat;
  }

  update(id: number, cat: Cat): Cat | undefined {
    const index = this.cats.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.cats[index] = cat;
    return cat;
  }

  partialUpdate(id: number, catPatch: Partial<Cat>): Cat | undefined {
    const cat = this.findOne(id);
    if (!cat) return undefined;
    Object.assign(cat, catPatch);
    return cat;
  }

  remove(id: number): boolean {
    const index = this.cats.findIndex(cat => cat.id === id);
    if (index === -1) return false;
    this.cats.splice(index, 1);
    return true;
  }
}
