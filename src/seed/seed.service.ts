import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertManyProducts(adminUser);
    return 'SEED EXECUTED';
  }

  private async deleteTables() {
    await this.productsService.deleAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete()
      .where({})
      .execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user));
    });

    await this.userRepository.save(users);

    return users[0];
  }
  
  // Eliminiar todos los productos
  private async insertManyProducts(user: User) {
    await this.productsService.deleAllProducts();
    const seedProducts = initialData.products;
    const insertPromises = seedProducts.map((product) => this.productsService.create(product, user));
    await Promise.all(insertPromises);
  }
}
