import { Body, Controller, Inject, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/services';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AuthController {
  @Inject(NATS_SERVICE) private readonly client: ClientProxy;
  constructor(
    private readonly authService: AuthService
  ) {}
  @MessagePattern('auth.register.user')
  registerUser(@Payload() registerUserDto: RegisterUserDto) {
    console.log('Payload' + registerUserDto);
    return this.authService.registerUser(registerUserDto);
  }
  @MessagePattern('auth.login.user')
  loginUser(@Payload() loginUserDto: LoginUserDto) {
    console.log('Payload' + loginUserDto);
    return this.authService.loginUser(loginUserDto);
  }
  
  @MessagePattern('auth.verify.user')
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }
}
