import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '../../core/constants';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: number;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtTokenService {
  generateTokens(userId: number | string, role: string): TokenPair {
    const numericUserId = Number(userId);
    const accessToken = jwt.sign(
      { userId: numericUserId, role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '2d' },
    );

    const refreshToken = jwt.sign(
      { userId: numericUserId, role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyAccessToken(token: string, options?: jwt.VerifyOptions): JwtPayload {
    return jwt.verify(token, ACCESS_TOKEN_SECRET, options) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
  }
}
