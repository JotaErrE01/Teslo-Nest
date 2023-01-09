import { Controller, Post, Body, HttpCode, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { Role } from './enums/roles.enum';
import { User } from './entities/user.entity';
import { Auth, GetUser } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthState(
    @GetUser() user: User,
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  // @Roles(Role.User) // seteamos los roles que pueden acceder a este endpoint en la metadata de la cabecera de la petición
  // @UseGuards(JwtGuard, RolesGuard) //jwtguard valida el token y rolesguard valida los roles
  @Auth(Role.Admin, Role.User, Role.SUPER_USER) //custom decorator que combina los dos anteriores
  getPrivate(
    @GetUser() user: User // obtenemos el usuario de la cabecera de la petición gracias al decorator AuthGuard
  ) {
    return {
      ok: true,
      message: 'hola mundo',
      user
    }
  }
}
