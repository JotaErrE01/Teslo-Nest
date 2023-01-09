import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { PaginationDTO } from '../common/dtos/pagination.dto';
import { validate } from 'uuid';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) { }

  async create(createProductDto: CreateProductDto, user: User) {
    const { images = [], ...newProduct } = createProductDto;
    try {
      const product = this.productRepository.create({
        ...newProduct,
        user,
        images: images.map((image) => this.productImageRepository.create({ url: image })),
      });
      await this.productRepository.save(product);
      return {
        ...product,
        images,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationgDTO: PaginationDTO) {
    const { limit = 10, offset = 0 } = paginationgDTO;
    const products = await this.productRepository.find({
      skip: offset,
      take: limit
    });

    return products.map((product) => ({
      ...product,
      images: product.images.map(({ url }) => url),
    }));
  }

  async findOne(term: string) {
    let product: Product;
    if (validate(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
        .innerJoinAndSelect('product.images', 'images')
        .where('slug = :term OR LOWER(title) = :term', { term: term.toLowerCase() })
        .getOne();
    }
    if (!product) throw new NotFoundException('No existe el producto');
    return {
      ...product,
      images: product.images.map(({ url }) => url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({ id, ...toUpdate });
    if (!product) throw new NotFoundException('No existe el producto');

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if(images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) => this.productImageRepository.create({ url: image }));
      }else {
        product.images = await this.productImageRepository.findBy({ product: { id } });
      }

      product.user = user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      
      return {
        ...product,
        images: product.images.map(({ url }) => url),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const { affected } = await this.productRepository.delete(id);
    if (affected === 0) throw new NotFoundException('No existe el producto');
    return {
      message: 'Producto eliminado',
    };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Error al crear el producto');
  }

  async deleAllProducts() {
    return await this.productRepository.delete({});
  }
}
