import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { MessageWsModule } from './message-ws/message-ws.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT')),
        database: configService.get('DB_NAME'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        autoLoadEntities: true,
        synchronize: true,
      })
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    MessageWsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
