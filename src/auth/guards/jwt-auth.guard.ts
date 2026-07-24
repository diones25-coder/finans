import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = { id: string; email: string }>(
    err: Error | null,
    user: TUser | false,
    info: { message?: string } | null,
  ): TUser {
    if (err) {
      this.logger.error(`JWT verification error: ${err.message}`, err.stack);
      throw err;
    }

    if (!user) {
      const reason = info?.message ?? 'token invalido';
      this.logger.warn(`JWT authentication failed: ${reason}`);
      throw new UnauthorizedException(reason);
    }

    return user;
  }
}
