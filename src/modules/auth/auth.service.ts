import { ISendMailOptions } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PayloadUserDto } from 'src/core/decorators';
import { FailInterface, SuccessInterface } from 'src/core/interfaces';
import { CurrentUser } from 'src/core/strategies/current-user.interface';
import { MailService } from '../mail/mail.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { RefreshSessionService } from '../refresh-session/application';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  LoginDto,
  MetadataDto,
  RegisterUserDto,
  ResetPasswordDto,
  TokenDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly cacheRedis: RedisCacheService,
    private readonly refreshSessionService: RefreshSessionService,
  ) {}

  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  public async resetPassword({
    email,
    code,
    newPassword,
  }: ResetPasswordDto): Promise<void> {
    const cacheCode = JSON.parse(await this.cacheRedis.get(email));
    if (cacheCode !== code) {
      throw new BadRequestException('not valid code');
    }
    await this.usersService.updateUserPasswordByEmail(email, newPassword);
    await this.cacheRedis.del(email);
  }

  public async sendVerificationCodeByEmail({
    email,
  }: {
    email: string;
  }): Promise<void> {
    const code = crypto.randomBytes(32).toString('hex');
    await this.cacheRedis.set(email, code);
    const data: ISendMailOptions = {
      to: email,
      from: process.env.SMTP_USERNAME,
      subject: 'Verification Code',
      text: 'code',
      html: `<b>Verification code: ${code}</b>`,
    };
    await this.mailService.sendToEmail(data);
  }

  async validateUser(login: string, password: string): Promise<any> {
    const user = await this.usersService.findUserByLogin(login);
    if (!user) {
      throw new NotFoundException('There is no user with such an login');
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      throw new UnauthorizedException('Invalid password');
    }
    if (user && comparePassword) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login({ login, password }: LoginDto, { ip, ua }: MetadataDto) {
    const user = await this.validateUser(login, password);
    const refreshSession: any =
      await this.refreshSessionService.getRefreshSession({
        ip,
        ua,
        userId: user._doc._id,
      });
    if (!refreshSession.length) {
      const accessToken = this._createToken(
        user._doc,
        +process.env.JWT_ACCESS_TOKEN_EXPIRESIN,
        process.env.JWT_ACCESS_TOKEN_SECRET,
      );
      const refreshToken = this._createToken(
        user._doc,
        +process.env.JWT_REFRESH_TOKEN_EXPIRESIN,
        process.env.JWT_REFRESH_TOKEN_SECRET,
      );
      await this.refreshSessionService.createRefreshSession({
        userId: user._doc._id,
        ip,
        ua,
        refreshToken: refreshToken.token,
      });
      return {
        accessToken,
        refreshToken,
      };
    } else {
      try {
        await this.jwtService.verify(refreshSession.refreshToken, {
          secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        });
        if (refreshSession.length) {
          throw new BadRequestException('you are authorized');
        }
      } catch (error) {
        const accessToken = this._createToken(
          user._doc,
          +process.env.JWT_ACCESS_TOKEN_EXPIRESIN,
          process.env.JWT_ACCESS_TOKEN_SECRET,
        );
        const refreshToken = this._createToken(
          user._doc,
          +process.env.JWT_REFRESH_TOKEN_EXPIRESIN,
          process.env.JWT_REFRESH_TOKEN_SECRET,
        );
        await this.refreshSessionService.updateRefreshSessionByUserId(
          user._doc._id,
          {
            refreshToken: refreshToken.token,
          },
        );
        return {
          accessToken,
          refreshToken,
        };
      }
    }
  }

  async registration(
    user: RegisterUserDto,
  ): Promise<FailInterface | SuccessInterface<UserEntity>> {
    const { password, ...data } = user;
    try {
      const hash = await bcrypt.hash(user.password, 10);
      const savedUser = await this.usersService.createUser({
        ...data,
        password: hash,
      });
      return { status: 'success', data: savedUser };
    } catch (err) {
      return { status: 'fail', message: err };
    }
  }

  public async refreshToken(
    refreshToken: string,
    { ua, ip }: MetadataDto,
  ): Promise<TokenDto> {
    try {
      const refreshSession = await this.refreshSessionService.getRefreshSession(
        { ua, ip, refreshToken },
      );
      if (!refreshSession.length) {
        throw new BadRequestException('refresh token not found');
      }
      await this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });
      const user: CurrentUser = { _id: refreshSession[0].userId };
      const accessToken = this._createToken(
        user,
        +process.env.JWT_ACCESS_TOKEN_EXPIRESIN,
        process.env.JWT_ACCESS_TOKEN_SECRET,
      );
      return accessToken;
    } catch (err) {
      throw new BadRequestException('refresh token is not valid');
    }
  }

  public async logoutFromDevice(
    { userId }: PayloadUserDto,
    { ua, ip }: MetadataDto,
  ): Promise<void> {
    await this.refreshSessionService.deleteRefreshSessionById({
      ua,
      ip,
      userId,
    });
  }

  public async logoutFromAllDevices({ userId }: PayloadUserDto): Promise<void> {
    await this.refreshSessionService.deleteRefreshSessionById({ userId });
  }

  private _createToken(user: CurrentUser, expiresIn, secret: string): TokenDto {
    const { _id } = user;
    const jwtUser = { _id };
    const token = this.jwtService.sign(jwtUser, { expiresIn, secret });
    return {
      expiresIn,
      token,
    };
  }
}
