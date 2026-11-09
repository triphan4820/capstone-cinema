import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  statusCode: number;
  message: string;
  content: T;
  dateTime: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseEnvelope<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseEnvelope<T>> {
    const res: Response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((content: T) => ({
        statusCode: res.statusCode || 200,
        message: 'Xử lý thành công!',
        content,
        dateTime: new Date().toISOString(),
      })),
    );
  }
}
