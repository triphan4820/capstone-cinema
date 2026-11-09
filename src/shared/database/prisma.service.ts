import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { DATABASE_URL } from '../../core/constants';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl =
      DATABASE_URL || 'mysql://root:password@localhost:3306/cinema_db';
    const parsed = new URL(dbUrl);

    const adapter = new PrismaMariaDb({
      host: parsed.hostname,
      user: parsed.username,
      password: parsed.password,
      database: parsed.pathname.substring(1),
      port: Number(parsed.port) || 3306,
      connectionLimit: 5,
    });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Database connection failed on startup: ${message}. Waiting for DB...`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
