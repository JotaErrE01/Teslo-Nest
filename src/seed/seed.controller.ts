import { Controller, Get } from '@nestjs/common';
import { Auth, GetUser } from 'src/auth/decorators';
import { Role } from 'src/auth/enums/roles.enum';
import { SeedService } from './seed.service';

@Controller('seed')
@Auth(Role.Admin)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  findAll() {
    return this.seedService.runSeed();
  }
}
