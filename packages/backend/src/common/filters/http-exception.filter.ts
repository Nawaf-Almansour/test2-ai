import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface StandardErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorBody: StandardErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (status === HttpStatus.BAD_REQUEST && typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;

        // Handle class-validator validation errors (array of messages)
        if (Array.isArray(resp.message)) {
          const fields: Record<string, string> = {};
          for (const msg of resp.message) {
            // Parse "property must be..." messages into field map
            const match = String(msg).match(/^([a-zA-Z0-9_.]+)\s/);
            if (match) {
              fields[match[1]] = String(msg);
            } else {
              fields['_general'] = (fields['_general'] ? fields['_general'] + '; ' : '') + String(msg);
            }
          }
          errorBody = {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Some fields are invalid.',
              fields: Object.keys(fields).length > 0 ? fields : undefined,
            },
          };
        } else if (resp.code || resp.error) {
          // Already formatted error from our service
          errorBody = {
            success: false,
            error: {
              code: resp.code || 'BAD_REQUEST',
              message: resp.message || 'Bad request',
              fields: resp.fields,
            },
          };
        } else if (typeof resp.message === 'string') {
          errorBody = {
            success: false,
            error: {
              code: 'BAD_REQUEST',
              message: resp.message,
            },
          };
        } else {
          errorBody = {
            success: false,
            error: {
              code: 'BAD_REQUEST',
              message: 'Invalid request data',
            },
          };
        }
      } else if (status === HttpStatus.TOO_MANY_REQUESTS) {
        errorBody = {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        };
      } else if (typeof exceptionResponse === 'string') {
        errorBody = {
          success: false,
          error: {
            code: `HTTP_${status}`,
            message: exceptionResponse,
          },
        };
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        errorBody = {
          success: false,
          error: {
            code: resp.code || resp.error || `HTTP_${status}`,
            message: resp.message || 'An error occurred',
            fields: resp.fields,
          },
        };
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
    }

    // Log server errors (5xx) but not client errors (4xx)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(errorBody);
  }
}
