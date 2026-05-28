import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttp ? exception.getResponse() : 'Internal server error';

    if (status >= 500) {
      this.logger.error({ err: exception, path: req.url, method: req.method });
    } else {
      this.logger.warn({ status, path: req.url, method: req.method, message });
    }

    res.status(status).json({
      statusCode: status,
      message:
        typeof message === 'string' ? message : (message as any).message,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
