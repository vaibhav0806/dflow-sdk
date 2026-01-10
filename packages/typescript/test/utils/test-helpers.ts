/**
 * Test Helper Utilities for DFlow SDK E2E Tests
 */

// Test result tracking
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

class TestRunner {
  private results: TestResult[] = [];

  phase(name: string): void {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${name}`);
    console.log(`${'═'.repeat(60)}\n`);
  }

  async test<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    const start = Date.now();
    try {
      const data = await fn();
      const duration = Date.now() - start;
      this.results.push({ name, passed: true, duration });
      console.log(`  ✓ ${name} (${duration}ms)`);
      return { success: true, data };
    } catch (error: any) {
      const duration = Date.now() - start;
      const errorMsg = error.message || String(error);
      this.results.push({ name, passed: false, error: errorMsg, duration });
      console.log(`  ✗ ${name} (${duration}ms)`);
      console.log(`    Error: ${errorMsg}`);
      // Show full API error response if available
      if (error.response) {
        console.log(`    Response: ${JSON.stringify(error.response).slice(0, 200)}`);
      }
      return { success: false, error: errorMsg };
    }
  }

  async testWithData<T>(
    name: string,
    fn: () => Promise<T>,
    validator?: (data: T) => void
  ): Promise<T | null> {
    const result = await this.test(name, async () => {
      const data = await fn();
      if (validator) {
        validator(data);
      }
      return data;
    });
    return result.success ? result.data : null;
  }

  log(message: string, indent: number = 4): void {
    console.log(`${' '.repeat(indent)}${message}`);
  }

  logData(label: string, value: any): void {
    if (typeof value === 'object' && value !== null) {
      console.log(`    ${label}: ${JSON.stringify(value).slice(0, 100)}...`);
    } else {
      console.log(`    ${label}: ${value}`);
    }
  }

  summary(): void {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;
    const totalDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0);

    console.log(`\n${'═'.repeat(60)}`);
    console.log('  TEST SUMMARY');
    console.log(`${'═'.repeat(60)}`);
    console.log(`  Total:   ${total} tests`);
    console.log(`  Passed:  ${passed} ✓`);
    console.log(`  Failed:  ${failed} ✗`);
    console.log(`  Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`${'═'.repeat(60)}\n`);

    if (failed > 0) {
      console.log('  Failed Tests:');
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`    ✗ ${r.name}`);
          console.log(`      ${r.error}`);
        });
      console.log('');
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  hasFailures(): boolean {
    return this.results.some((r) => !r.passed);
  }
}

// Assertion helpers
function assertDefined<T>(value: T | null | undefined, message: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

function assertArray(value: any, message: string, minLength: number = 0): void {
  if (!Array.isArray(value)) {
    throw new Error(`${message}: expected array, got ${typeof value}`);
  }
  if (value.length < minLength) {
    throw new Error(`${message}: expected at least ${minLength} items, got ${value.length}`);
  }
}

function assertString(value: any, message: string): void {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${message}: expected non-empty string`);
  }
}

function assertNumber(value: any, message: string): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${message}: expected number, got ${typeof value}`);
  }
}

function assertGreaterThan(value: number, threshold: number, message: string): void {
  if (value <= threshold) {
    throw new Error(`${message}: expected > ${threshold}, got ${value}`);
  }
}

// Delay helper
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Format helpers
function formatBalance(amount: number, decimals: number = 6): string {
  return (amount / Math.pow(10, decimals)).toFixed(decimals);
}

function formatUSDC(lamports: number | string): string {
  const amount = typeof lamports === 'string' ? parseInt(lamports) : lamports;
  return `${(amount / 1_000_000).toFixed(6)} USDC`;
}

function formatSOL(lamports: number): string {
  return `${(lamports / 1_000_000_000).toFixed(9)} SOL`;
}

function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Config helpers
interface TestConfig {
  privateKey: string;
  apiKey?: string;
  rpcUrl: string;
  tradeAmountUSDC: number;
}

function loadConfig(): TestConfig {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }

  return {
    privateKey,
    apiKey: process.env.DFLOW_API_KEY,
    rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
    tradeAmountUSDC: parseFloat(process.env.TRADE_AMOUNT_USDC || '0.1'),
  };
}

export {
  TestRunner,
  TestResult,
  TestConfig,
  assertDefined,
  assertArray,
  assertString,
  assertNumber,
  assertGreaterThan,
  sleep,
  formatBalance,
  formatUSDC,
  formatSOL,
  shortenAddress,
  loadConfig,
};
