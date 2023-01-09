import { Controller, Post, UploadedFile, ParseFilePipe, FileTypeValidator, Get, Param, Res, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService
  ) { }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    return res.sendFile(this.filesService.getStaticProductImage(imageName));
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile(new ParseFilePipe({
    fileIsRequired: true,
    validators: [
      new FileTypeValidator({ fileType: 'image' })
      // new MaxFileSizeValidator({ maxSize: 50000 }),
    ],
  })) file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }
}
