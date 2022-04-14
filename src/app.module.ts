import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { RedisCacheModule } from './modules/redis-cache/redis-cache.module';
import { RefreshSessionModule } from './modules/refresh-session';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RedisCacheModule,
    UsersModule,
    MailModule,
    RefreshSessionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
