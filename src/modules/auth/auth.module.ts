import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy, JwtStrategy } from 'src/core/strategies';
import { MailModule } from '../mail/mail.module';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { RefreshSessionModule } from '../refresh-session';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    RedisCacheModule,
    MailModule,
    UsersModule,
    RefreshSessionModule,
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
