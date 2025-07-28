"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatsService = void 0;
const common_1 = require("@nestjs/common");
let CatsService = class CatsService {
    cats = [];
    nextId = 1;
    findAll() {
        return this.cats;
    }
    findOne(id) {
        return this.cats.find(cat => cat.id === id);
    }
    create(cat) {
        const newCat = { id: this.nextId++, ...cat };
        this.cats.push(newCat);
        return newCat;
    }
    update(id, cat) {
        const index = this.cats.findIndex(c => c.id === id);
        if (index === -1)
            return undefined;
        this.cats[index] = cat;
        return cat;
    }
    partialUpdate(id, catPatch) {
        const cat = this.findOne(id);
        if (!cat)
            return undefined;
        Object.assign(cat, catPatch);
        return cat;
    }
    remove(id) {
        const index = this.cats.findIndex(cat => cat.id === id);
        if (index === -1)
            return false;
        this.cats.splice(index, 1);
        return true;
    }
};
exports.CatsService = CatsService;
exports.CatsService = CatsService = __decorate([
    (0, common_1.Injectable)()
], CatsService);
//# sourceMappingURL=cats.service.js.map