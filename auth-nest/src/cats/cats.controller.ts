import { Controller, Get, Post, Put, Patch, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { CatsService, Cat } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  // GET /cats - get all cats
  @Get()
  findAll(): Cat[] {
    return this.catsService.findAll();
  }

  // GET /cats/hi - custom greeting endpoint
  @Get('hi')
  sayHi(): string {
    return 'Hello from /cats/hi endpoint!';
  }

  // GET /cats/:id - get cat by id
  @Get(':id')
  findOne(@Param('id') id: string): Cat {
    const cat = this.catsService.findOne(+id);
    if (!cat) {
      throw new NotFoundException(`Cat with id ${id} not found`);
    }
    return cat;
  }

  // POST /cats - create a new cat
  @Post()
  create(@Body() catData: Cat): Cat {
    return this.catsService.create(catData);
  }

  // PUT /cats/:id - replace a cat entirely
  @Put(':id')
  update(@Param('id') id: string, @Body() catData: Cat): Cat {
    const updatedCat = this.catsService.update(+id, catData);
    if (!updatedCat) {
      throw new NotFoundException(`Cat with id ${id} not found`);
    }
    return updatedCat;
  }

  // PATCH /cats/:id - partial update a cat
  @Patch(':id')
  partialUpdate(@Param('id') id: string, @Body() catData: Partial<Cat>): Cat {
    const updatedCat = this.catsService.partialUpdate(+id, catData);
    if (!updatedCat) {
      throw new NotFoundException(`Cat with id ${id} not found`);
    }
    return updatedCat;
  }

  // DELETE /cats/:id - delete cat by id
  @Delete(':id')
  remove(@Param('id') id: string): { message: string } {
    const removed = this.catsService.remove(+id);
    if (!removed) {
      throw new NotFoundException(`Cat with id ${id} not found`);
    }
    return { message: `Cat with id ${id} deleted successfully` };
  }
}
