import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshSessionService } from 'src/modules/refresh-session/application';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UsersService,
    private reflector: Reflector,
    private refreshSessionService: RefreshSessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (req, jwtToken, done) => {
        const ua = req.header('user-agent');
        const ip = req.header('x-forwarded-for');
        const decodeToken: any = jwt.decode(jwtToken);
        this.refreshSessionService
          .getRefreshSession({
            ua,
            ip,
            userId: decodeToken._id,
          })
          .then((result) => {
            if (result.length) {
              done(null, process.env.JWT_ACCESS_TOKEN_SECRET);
            } else {
              done(null, null);
            }
          });
      },
    });
  }

  async validate(payload): Promise<any> {
    const user = await this.userService.getUserById(payload._id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      userId: user._id,
    };
  }
}
