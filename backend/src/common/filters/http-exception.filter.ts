import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 50001;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || message;
        code = resp.code || this.getCodeFromStatus(status);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      code,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }

  private getCodeFromStatus(status: number): number {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 10001;
      case HttpStatus.UNAUTHORIZED:
        return 20001;
      case HttpStatus.FORBIDDEN:
        return 20002;
      case HttpStatus.NOT_FOUND:
        return 30001;
      case HttpStatus.CONFLICT:
        return 30002;
      default:
        return 50001;
    }
  }
}
