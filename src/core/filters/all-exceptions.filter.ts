import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseEnvelope {
  success: boolean;
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        error =
          typeof resObj.error === 'string' ? resObj.error : exception.name;
        message = (resObj.message as string | string[]) || exception.message;
      } else {
        error = exception.name;
        message = typeof res === 'string' ? res : exception.message;
      }
    } else if (exception instanceof Error) {
      if (exception.name === 'PrismaClientKnownRequestError') {
        const code = (exception as unknown as { code?: string }).code;
        if (code === 'P2002') {
          statusCode = HttpStatus.CONFLICT;
          error = 'Unique Constraint Violation';
          message = 'A record with this unique identifier already exists';
        } else if (code === 'P2025') {
          statusCode = HttpStatus.NOT_FOUND;
          error = 'Not Found';
          message = 'Target record does not exist';
        }
      } else {
        message = exception.message;
      }
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${String(message)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const payload: ErrorResponseEnvelope = {
      success: false,
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(payload);
  }
}
