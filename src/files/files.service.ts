import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { join } from 'path';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  getStaticProductImage(imageName: string) {
    // verificar si la imagen existe
    const path = join(__dirname, '../../static/products', imageName);
    if (!path) throw new NotFoundException(`Image not found ${imageName}`);
    return path;
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    // save file in static folder
    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `${uuid()}.${fileExtension}`;
    const path = join(__dirname, '../../static/products', fileName);
    try {
      await fs.writeFile(path, file.buffer);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error saving file');
    }

    return { url: `${this.configService.get('HOST_API')}/files/product/${fileName}` };
  }
}
