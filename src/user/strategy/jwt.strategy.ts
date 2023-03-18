import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { jwtPayload } from '../jwt-playload.interface';
import { User } from '../entities/user.entity';
import { AppError } from '../../commons/errors/app-error';

@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    super({
      secretOrKey: 'amine@^scret@$senlife@!',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: jwtPayload): Promise<User> {
    const result: any = payload;
    const auth: User = await this.userRepo.findOneBy({ email: result.user });
    if (!auth) {
      throw new UnauthorizedException();
    }
    return auth;
  }
}
