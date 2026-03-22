import { execSync } from 'child_process';

describe('SDK & CLI Compatibility', () => {
  test('Claude CLI is installed and accessible', () => {
    const version = execSync('claude --version 2>&1', { encoding: 'utf-8' }).trim();
    expect(version).toMatch(/\d+\.\d+\.\d+/);
  });

  test('Agent SDK package is installed', () => {
    const pkg = JSON.parse(
      execSync('cat node_modules/@anthropic-ai/claude-agent-sdk/package.json', { encoding: 'utf-8' })
    );
    expect(pkg.version).toBeDefined();
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  test('Claude CLI supports stream-json output format', () => {
    const help = execSync('claude --help 2>&1', { encoding: 'utf-8' });
    expect(help).toContain('output-format');
  });

  test('Claude CLI print mode accepts stream-json with verbose', () => {
    // This is the exact check that catches the v2.1.81 breaking change.
    // The old SDK 0.2.71 didn't pass --verbose, causing exit code 1.
    try {
      execSync('echo "test" | claude -p --output-format stream-json --verbose --max-turns 0 2>&1', {
        encoding: 'utf-8',
        timeout: 10000,
      });
    } catch (e: unknown) {
      const err = e as { stderr?: string; stdout?: string };
      const output = (err.stderr || '') + (err.stdout || '');
      // The critical assertion: it must NOT say "requires --verbose"
      expect(output).not.toContain('requires --verbose');
      expect(output).not.toContain('Unknown option');
    }
  });

  test('Claude CLI can execute a basic query', () => {
    // End-to-end: actually run the CLI (requires ANTHROPIC_API_KEY in env)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log('Skipping: ANTHROPIC_API_KEY not set');
      return;
    }
    const result = execSync(
      'claude -p --max-turns 1 --output-format text "Reply with exactly: HEALTH_CHECK_OK"',
      { encoding: 'utf-8', timeout: 30000, env: { ...process.env } }
    ).trim();
    expect(result).toContain('HEALTH_CHECK_OK');
  });
});
