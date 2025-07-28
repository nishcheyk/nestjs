export interface Cat {
    id: number;
    name: string;
    age: number;
}
export declare class CatsService {
    private cats;
    private nextId;
    findAll(): Cat[];
    findOne(id: number): Cat | undefined;
    create(cat: Omit<Cat, 'id'>): Cat;
    update(id: number, cat: Cat): Cat | undefined;
    partialUpdate(id: number, catPatch: Partial<Cat>): Cat | undefined;
    remove(id: number): boolean;
}
