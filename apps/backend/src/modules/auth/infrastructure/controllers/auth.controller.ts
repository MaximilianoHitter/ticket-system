import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUseCase } from '../../application/login.use-case';
import { LoginRequestDto } from '../dto/request/login.request.dto';
import { LoginResponseDto } from '../dto/response/login.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    const output = await this.loginUseCase.execute(dto.toInput());
    return LoginResponseDto.fromOutput(output);
  }
}
