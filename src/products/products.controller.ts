import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { Role } from '../auth/enums/roles.enum';
import { User } from '../auth/entities/user.entity';
import { WebSocketServer } from '@nestjs/websockets';
import { MessageWsGateway, dataSocket } from '../message-ws/message-ws.gateway';
import { Socket, Server } from 'socket.io';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @Auth(Role.Admin)
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationgDTO: PaginationDTO) {
    return this.productsService.findAll(paginationgDTO);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOne(term);
  }

  @Patch(':id')
  @Auth(Role.Admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(Role.Admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  @Get('socket/sendMessage')
  socket() {
    dataSocket.emit('message-from-server', {
      fullName: 'Server',
      message: 'Hello from server'
    });
    return 'Message sent';
  }
}
