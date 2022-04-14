import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PayloadUserDto } from 'src/core/decorators';
import { Payload } from 'src/core/decorators/payload.decorator';
import { GoogleAuthGuard, JwtAuthGuard } from 'src/core/guards';
import {
  FailInterface,
  StatusInterface,
  SuccessInterface,
} from 'src/core/interfaces';
import { CurrentUser } from 'src/core/strategies/current-user.interface';
import { UserEntity } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import {
  AccessTokenDto,
  LoginDto,
  RefreshTokenDto,
  RegisterUserDto,
  ResetPasswordDto,
  SendVerificationCodeDto,
} from './dto';
import { LoginTokenDto } from './dto/login-token.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() body: LoginDto, @Request() req): Promise<LoginTokenDto> {
    return await this.authService.login(body, {
      ip: req.header('x-forwarded-for'),
      ua: req.header('user-agent'),
    });
  }

  @Post('/registration')
  async registration(
    @Body() body: RegisterUserDto,
  ): Promise<FailInterface | SuccessInterface<UserEntity>> {
    return await this.authService.registration(body);
  }

  @Post('/refreshToken')
  async refreshToken(
    @Body() body: RefreshTokenDto,
    @Request() req,
  ): Promise<AccessTokenDto> {
    const accessToken = await this.authService.refreshToken(body.refreshToken, {
      ip: req.header('x-forwarded-for'),
      ua: req.header('user-agent'),
    });
    return { accessToken };
  }

  @ApiBearerAuth('access-token')
  @Post('/me')
  @UseGuards(JwtAuthGuard)
  whoAmI(@Payload() user: CurrentUser) {
    return user;
  }

  @Post('/send-verification-code')
  async sendVerificationCode(
    @Body() body: SendVerificationCodeDto,
  ): Promise<StatusInterface> {
    await this.authService.sendVerificationCodeByEmail(body);
    return { status: 'success', message: 'code sent' };
  }

  @Post('/reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
  ): Promise<StatusInterface> {
    await this.authService.resetPassword(body);
    return { status: 'success', message: 'password update' };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  @Post('/logout')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Payload() user: PayloadUserDto,
    @Request() req,
  ): Promise<StatusInterface> {
    await this.authService.logoutFromDevice(user, {
      ip: req.header('x-forwarded-for'),
      ua: req.header('user-agent'),
    });
    return { status: 'success', message: 'logged out of this device' };
  }

  @Post('/multiply-logout')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async multiplyLogout(
    @Payload() user: PayloadUserDto,
  ): Promise<StatusInterface> {
    await this.authService.logoutFromAllDevices(user);
    return { status: 'success', message: 'logged out from all devices' };
  }
}
