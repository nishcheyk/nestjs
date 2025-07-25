import { Controller, Get, Post, Body } from '@nestjs/common';
import { CatsService, Cat } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll(): Cat[] {
    return this.catsService.findAll();
  }

  @Post()
  create(@Body() catData: Cat): Cat {
    return this.catsService.create(catData);
  }
}
