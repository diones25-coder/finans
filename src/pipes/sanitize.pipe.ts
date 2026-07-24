import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [], // Remove todas as tags HTML
        allowedAttributes: {}, // Remove todos os atributos
      });
    }

    return value;
  }
}
