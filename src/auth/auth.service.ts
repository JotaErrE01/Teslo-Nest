import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { hashSync, compareSync } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = hashSync(createUserDto.password, 10);
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      delete user.password;
      delete user.isActive;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: { email: true, password: true, id: true },
    });
    if(!user) throw new BadRequestException('Invalid Credentials');

    const result = compareSync(loginUserDto.password, user.password);
    if(!result) throw new BadRequestException('Invalid credentials');
    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    }
  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    }
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if(error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);
    throw new InternalServerErrorException('Something went wrong');
  }
}
