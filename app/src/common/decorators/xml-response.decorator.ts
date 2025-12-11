import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark endpoints that support XML responses
 * This is informational and can be used for documentation
 */
export const XML_RESPONSE_KEY = 'xml_response';
export const XmlResponse = () => SetMetadata(XML_RESPONSE_KEY, true);
