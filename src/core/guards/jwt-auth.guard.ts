import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { PrismaService } from '../../shared/database/prisma.service';
import { JwtTokenService } from '../../shared/jwt/jwt-token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface RequestWithUser extends Request {
  user?: unknown;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtTokenService: JwtTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    try {
      const payload = this.jwtTokenService.verifyAccessToken(token);
      const user = await this.prisma.users.findUnique({
        where: {
          userId: Number(payload.userId),
        },
      });

      if (!user || user.isDeleted) {
        throw new UnauthorizedException(
          'User account is invalid or deactivated',
        );
      }

      request.user = user;
      return true;
    } catch (err: unknown) {
      if (err instanceof TokenExpiredError) {
        throw new ForbiddenException('Access token has expired');
      }
      const message =
        err instanceof Error ? err.message : 'Unauthorized access';
      throw new UnauthorizedException(message);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
