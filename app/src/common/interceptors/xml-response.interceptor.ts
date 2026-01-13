import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Builder } from 'xml2js';

/**
 * XML Response Interceptor
 * Converts JSON responses to XML when client requests application/xml
 */
@Injectable()
export class XmlResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const acceptHeader = request.headers['accept'] || '';
    const wantsXml = acceptHeader.includes('application/xml') || 
                     acceptHeader.includes('text/xml');

    if (!wantsXml) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        response.header('Content-Type', 'application/xml');
        return this.convertToXml(data);
      }),
    );
  }

  private convertToXml(data: any): string {
    const builder = new Builder({
      rootName: 'response',
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ' },
    });

    try {
      return builder.buildObject(data);
    } catch (error) {
      return builder.buildObject({
        error: 'Failed to convert response to XML',
        message: error.message,
      });
    }
  }
}
