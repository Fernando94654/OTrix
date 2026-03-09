import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignInDto } from './dto/signInDto.js';
import { SignUpDto } from './dto/signUpDto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signIn')
  async login(@Body() signIn: SignInDto) {
    return this.authService.signIn(signIn);
  }

  @Post('signUp')
  async signup(@Body() signUp: SignUpDto) {
    return this.authService.signUp(signUp);
  }
}
