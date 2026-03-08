import SwaggerParser from '@apidevtools/swagger-parser';
import type { ParsedSpec, EndpointInfo } from './types';

export async function validateAndParseSpec(rawSpec: string): Promise<{
  valid: boolean;
  parsed?: ParsedSpec;
  errors?: string[];
}> {
  try {
    // Parse JSON or YAML
    let specObj: Record<string, unknown>;
    try {
      specObj = JSON.parse(rawSpec);
    } catch {
      // Try YAML - swagger-parser handles both, but we need an object
      // For YAML input, we'd need js-yaml. For now, require JSON.
      return {
        valid: false,
        errors: ['Please provide a valid JSON OpenAPI specification. YAML support coming soon.'],
      };
    }

    // Validate with swagger-parser (supports OpenAPI 3.x and Swagger 2.0)
    const api = await SwaggerParser.validate(specObj as never);

    // Extract endpoint info with descriptions
    const endpoints: EndpointInfo[] = [];
    const paths = (api as Record<string, unknown>).paths as Record<string, Record<string, unknown>> | undefined;

    if (paths) {
      for (const [path, methods] of Object.entries(paths)) {
        for (const [method, operation] of Object.entries(methods)) {
          if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
            const op = operation as Record<string, unknown>;
            endpoints.push({
              path,
              method: method.toUpperCase(),
              summary: (op.summary as string) || undefined,
              description: (op.description as string) || undefined,
              operationId: (op.operationId as string) || undefined,
            });
          }
        }
      }
    }

    const info = (api as Record<string, unknown>).info as Record<string, unknown>;
    const servers = (api as Record<string, unknown>).servers as Array<Record<string, unknown>> | undefined;

    const parsed: ParsedSpec = {
      name: (info?.title as string) || 'Unknown API',
      description: (info?.description as string) || '',
      version: (info?.version as string) || '',
      baseUrl: servers?.[0]?.url as string | undefined,
      endpointCount: endpoints.length,
      endpoints,
    };

    return { valid: true, parsed };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown validation error';
    return {
      valid: false,
      errors: [message],
    };
  }
}
