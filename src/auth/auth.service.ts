import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }
  
  private readonly logger = new Logger(AuthService.name);

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    this.logger.log(`Validando usuario`);

    const { password: _, ...result } = user;
    void _;
    return result;
  }

  login(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };

    this.logger.log(`Gerando token para o usuario`);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    const payload = { sub: user.id, email: user.email };

    this.logger.log(`Criando um novo usuario e gerando token`);
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
