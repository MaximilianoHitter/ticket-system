import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUseCase } from '../../application/login.use-case';
import { LoginRequestDto } from '../dto/request/login.request.dto';
import { LoginResponseDto } from '../dto/response/login.response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Autorización')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: () => LoginRequestDto })
  @ApiOperation({ summary: 'Iniciar sesión con usuario y contraseña' })
  @ApiResponse({ type: () => LoginResponseDto })
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    const output = await this.loginUseCase.execute(dto.toInput());
    return LoginResponseDto.fromOutput(output);
  }
}
