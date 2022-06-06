import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction } from 'express';
import { ExpressRequestInterface } from 'src/types/express-request.interface';
import { verify } from 'jsonwebtoken';
import configuration from 'src/config/configuration';
import { UserService } from '../user.service';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}
  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];
    const jwtSecret = this.configService.get<string>('app.jwtSecret');
    try {
      const decode = verify(token, jwtSecret);

      const user = await this.userService.findById(decode.id);
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      req.user = null;
      next();
    }
  }
}
