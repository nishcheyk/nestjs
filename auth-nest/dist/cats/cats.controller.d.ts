import { CatsService, Cat } from './cats.service';
export declare class CatsController {
    private readonly catsService;
    constructor(catsService: CatsService);
    findAll(): Cat[];
    sayHi(): string;
    findOne(id: string): Cat;
    create(catData: Cat): Cat;
    update(id: string, catData: Cat): Cat;
    partialUpdate(id: string, catData: Partial<Cat>): Cat;
    remove(id: string): {
        message: string;
    };
}
