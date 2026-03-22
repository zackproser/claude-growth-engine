import { validateAndParseSpec } from '@/lib/spec-parser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Spec Parser', () => {
  test('validates a correct OpenAPI spec', async () => {
    const raw = readFileSync(join(__dirname, '../../examples/sample-spec.json'), 'utf-8');
    const result = await validateAndParseSpec(raw);
    expect(result.valid).toBe(true);
    expect(result.parsed).toBeDefined();
    expect(result.parsed!.name).toBe('PayFlow API');
    expect(result.parsed!.endpointCount).toBeGreaterThan(0);
  });

  test('rejects invalid JSON', async () => {
    const result = await validateAndParseSpec('not json at all');
    expect(result.valid).toBe(false);
  });

  test('rejects empty object', async () => {
    const result = await validateAndParseSpec('{}');
    expect(result.valid).toBe(false);
  });

  test('parsed spec has expected fields', async () => {
    const raw = readFileSync(join(__dirname, '../../examples/sample-spec.json'), 'utf-8');
    const result = await validateAndParseSpec(raw);
    expect(result.parsed).toMatchObject({
      name: expect.any(String),
      version: expect.any(String),
      endpointCount: expect.any(Number),
      endpoints: expect.any(Array),
    });
  });

  test('endpoints have method and path', async () => {
    const raw = readFileSync(join(__dirname, '../../examples/sample-spec.json'), 'utf-8');
    const result = await validateAndParseSpec(raw);
    for (const endpoint of result.parsed!.endpoints) {
      expect(endpoint.method).toBeDefined();
      expect(endpoint.path).toBeDefined();
    }
  });
});
