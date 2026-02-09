/**
 * DFlow SDK Proof KYC API Test Suite
 *
 * Run with: npx tsx test/proof-test.ts
 *
 * This test suite covers:
 * - Unit tests for generateSignatureMessage and buildDeepLink (no network required)
 * - Integration tests for verifyAddress (hits actual Proof API)
 */

import {
  DFlowClient,
  PROOF_API_BASE_URL,
  PROOF_DEEP_LINK_BASE_URL,
  PROOF_SIGNATURE_MESSAGE_PREFIX,
} from '../src/index.js';
import type { DeepLinkParams } from '../src/types/proof.js';
import { TestRunner, assertDefined, assertString } from './utils/test-helpers.js';

const runner = new TestRunner();

// ============================================================================
// HELPER ASSERTIONS
// ============================================================================

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected "${expected}", got "${actual}"`);
  }
}

function assertContains(str: string, substring: string, message: string): void {
  if (!str.includes(substring)) {
    throw new Error(`${message}: expected string to contain "${substring}"\n  Got: "${str}"`);
  }
}

function assertNotContains(str: string, substring: string, message: string): void {
  if (str.includes(substring)) {
    throw new Error(`${message}: expected string NOT to contain "${substring}"\n  Got: "${str}"`);
  }
}

function assertStartsWith(str: string, prefix: string, message: string): void {
  if (!str.startsWith(prefix)) {
    throw new Error(`${message}: expected string to start with "${prefix}"\n  Got: "${str}"`);
  }
}

function assertBoolean(value: any, message: string): void {
  if (typeof value !== 'boolean') {
    throw new Error(`${message}: expected boolean, got ${typeof value}`);
  }
}

// ============================================================================
// PHASE 1: CONSTANTS TESTS
// ============================================================================

async function phase1Constants(): Promise<boolean> {
  runner.phase('PHASE 1: Constants Tests');

  await runner.test('1.1 PROOF_API_BASE_URL is correctly defined', async () => {
    assertEqual(PROOF_API_BASE_URL, 'https://proof.dflow.net', 'PROOF_API_BASE_URL');
    return PROOF_API_BASE_URL;
  });

  await runner.test('1.2 PROOF_DEEP_LINK_BASE_URL is correctly defined', async () => {
    assertEqual(PROOF_DEEP_LINK_BASE_URL, 'https://dflow.net/proof', 'PROOF_DEEP_LINK_BASE_URL');
    return PROOF_DEEP_LINK_BASE_URL;
  });

  await runner.test('1.3 PROOF_SIGNATURE_MESSAGE_PREFIX is correctly defined', async () => {
    assertEqual(
      PROOF_SIGNATURE_MESSAGE_PREFIX,
      'Proof KYC verification: ',
      'PROOF_SIGNATURE_MESSAGE_PREFIX'
    );
    return PROOF_SIGNATURE_MESSAGE_PREFIX;
  });

  return true;
}

// ============================================================================
// PHASE 2: SIGNATURE MESSAGE TESTS (Unit Tests - No Network)
// ============================================================================

async function phase2SignatureMessage(): Promise<boolean> {
  runner.phase('PHASE 2: Signature Message Tests');

  const dflow = new DFlowClient();

  await runner.test('2.1 generateSignatureMessage with explicit timestamp', async () => {
    const message = dflow.proof.generateSignatureMessage(1699123456789);
    assertEqual(message, 'Proof KYC verification: 1699123456789', 'Message format');
    return message;
  });

  await runner.test('2.2 generateSignatureMessage without timestamp uses current time', async () => {
    const before = Date.now();
    const message = dflow.proof.generateSignatureMessage();
    const after = Date.now();

    assertStartsWith(message, 'Proof KYC verification: ', 'Message prefix');

    const timestampStr = message.split(': ')[1];
    const timestamp = parseInt(timestampStr, 10);

    if (timestamp < before || timestamp > after) {
      throw new Error(`Timestamp ${timestamp} should be between ${before} and ${after}`);
    }

    return message;
  });

  await runner.test('2.3 generateSignatureMessage format is correct', async () => {
    const message = dflow.proof.generateSignatureMessage(1234567890123);

    assertContains(message, 'Proof KYC verification: ', 'Message contains prefix');
    assertContains(message, '1234567890123', 'Message contains timestamp');

    const parts = message.split(': ');
    assertEqual(parts.length, 2, 'Message has two parts');
    assertEqual(parts[0], 'Proof KYC verification', 'First part is prefix');
    assertEqual(parts[1], '1234567890123', 'Second part is timestamp');

    return message;
  });

  await runner.test('2.4 generateSignatureMessage produces different messages for different timestamps', async () => {
    const message1 = dflow.proof.generateSignatureMessage(1000000000000);
    const message2 = dflow.proof.generateSignatureMessage(2000000000000);

    if (message1 === message2) {
      throw new Error('Messages should be different for different timestamps');
    }

    assertContains(message1, '1000000000000', 'Message 1 contains timestamp 1');
    assertContains(message2, '2000000000000', 'Message 2 contains timestamp 2');

    return { message1, message2 };
  });

  return true;
}

// ============================================================================
// PHASE 3: DEEP LINK TESTS (Unit Tests - No Network)
// ============================================================================

async function phase3DeepLink(): Promise<boolean> {
  runner.phase('PHASE 3: Deep Link Tests');

  const dflow = new DFlowClient();

  await runner.test('3.1 buildDeepLink with required parameters only', async () => {
    const link = dflow.proof.buildDeepLink({
      wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      signature: '5TuPHPFe7p3nLh',
      timestamp: 1699123456789,
      redirectUri: 'https://myapp.com/callback',
    });

    assertStartsWith(link, 'https://dflow.net/proof?', 'Deep link base URL');
    assertContains(link, 'wallet=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'Wallet param');
    assertContains(link, 'signature=5TuPHPFe7p3nLh', 'Signature param');
    assertContains(link, 'timestamp=1699123456789', 'Timestamp param');
    assertContains(link, 'redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback', 'Redirect URI param');
    assertNotContains(link, 'projectId', 'No projectId when not provided');

    return link;
  });

  await runner.test('3.2 buildDeepLink with optional projectId', async () => {
    const link = dflow.proof.buildDeepLink({
      wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      signature: '5TuPHPFe7p3nLh',
      timestamp: 1699123456789,
      redirectUri: 'https://myapp.com/callback',
      projectId: 'my-dapp-project',
    });

    assertContains(link, 'projectId=my-dapp-project', 'ProjectId param');

    return link;
  });

  await runner.test('3.3 buildDeepLink URL encodes special characters in signature', async () => {
    const link = dflow.proof.buildDeepLink({
      wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      signature: 'abc+def/ghi=',
      timestamp: 1699123456789,
      redirectUri: 'https://example.com',
    });

    // URLSearchParams encodes + as %2B, / as %2F, = as %3D
    assertContains(link, 'signature=abc%2Bdef%2Fghi%3D', 'Signature URL encoded');

    return link;
  });

  await runner.test('3.4 buildDeepLink URL encodes special characters in redirectUri', async () => {
    const link = dflow.proof.buildDeepLink({
      wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      signature: 'test',
      timestamp: 1699123456789,
      redirectUri: 'https://myapp.com/callback?foo=bar&baz=qux',
    });

    // The redirect_uri should be fully URL encoded
    assertContains(
      link,
      'redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback%3Ffoo%3Dbar%26baz%3Dqux',
      'Redirect URI fully encoded'
    );

    return link;
  });

  await runner.test('3.5 buildDeepLink uses correct base URL', async () => {
    const link = dflow.proof.buildDeepLink({
      wallet: 'TestWallet123',
      signature: 'test',
      timestamp: 1699123456789,
      redirectUri: 'https://example.com',
    });

    assertStartsWith(link, PROOF_DEEP_LINK_BASE_URL, 'Uses PROOF_DEEP_LINK_BASE_URL');

    return link;
  });

  await runner.test('3.6 buildDeepLink includes all required parameters', async () => {
    const params: DeepLinkParams = {
      wallet: 'WalletAddress123',
      signature: 'SignatureValue456',
      timestamp: 9876543210123,
      redirectUri: 'https://partner.com/verify',
      projectId: 'partner-project',
    };

    const link = dflow.proof.buildDeepLink(params);

    // Verify all params are present
    assertContains(link, 'wallet=WalletAddress123', 'Wallet');
    assertContains(link, 'signature=SignatureValue456', 'Signature');
    assertContains(link, 'timestamp=9876543210123', 'Timestamp');
    assertContains(link, 'redirect_uri=', 'Redirect URI key');
    assertContains(link, 'projectId=partner-project', 'ProjectId');

    return link;
  });

  return true;
}

// ============================================================================
// PHASE 4: VERIFY ADDRESS TESTS (Integration Tests - Hits Real API)
// ============================================================================

async function phase4VerifyAddress(): Promise<boolean> {
  runner.phase('PHASE 4: Verify Address Tests (Integration)');

  const dflow = new DFlowClient();

  // Note: These tests hit the actual Proof API
  // We test with addresses that are likely not verified to ensure the API is working

  await runner.test('4.1 verifyAddress returns response with verified field', async () => {
    // Use a random-looking address that is almost certainly not verified
    const result = await dflow.proof.verifyAddress('11111111111111111111111111111111');

    assertDefined(result, 'Response should be defined');
    assertBoolean(result.verified, 'verified field should be boolean');

    runner.log(`Address verified: ${result.verified}`);

    return result;
  });

  await runner.test('4.2 verifyAddress with unverified wallet returns verified=false', async () => {
    // Use the system program address which will definitely not be KYC verified
    const result = await dflow.proof.verifyAddress('11111111111111111111111111111111');

    assertEqual(result.verified, false, 'System program should not be verified');

    return result;
  });

  await runner.test('4.3 verifyAddress with valid Solana address format', async () => {
    // Test with a properly formatted but almost certainly unverified address
    const result = await dflow.proof.verifyAddress(
      'DFlow1111111111111111111111111111111111111'
    );

    assertDefined(result, 'Response should be defined');
    assertBoolean(result.verified, 'verified field should be boolean');

    return result;
  });

  return true;
}

// ============================================================================
// PHASE 5: INTEGRATION FLOW TESTS
// ============================================================================

async function phase5IntegrationFlow(): Promise<boolean> {
  runner.phase('PHASE 5: Integration Flow Tests');

  const dflow = new DFlowClient();

  await runner.test('5.1 Full partner verification flow simulation', async () => {
    const walletAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

    // Step 1: Check if wallet is verified (likely not)
    const initialStatus = await dflow.proof.verifyAddress(walletAddress);
    runner.log(`Initial verification status: ${initialStatus.verified}`);

    // Step 2: Generate signature message
    const timestamp = Date.now();
    const message = dflow.proof.generateSignatureMessage(timestamp);
    runner.log(`Generated message: ${message}`);
    assertContains(message, String(timestamp), 'Message contains timestamp');

    // Step 3: Build deep link for verification
    const deepLink = dflow.proof.buildDeepLink({
      wallet: walletAddress,
      signature: 'simulated_signature_base58',
      timestamp,
      redirectUri: 'https://partner-app.com/verified',
      projectId: 'test-partner',
    });

    runner.log(`Deep link generated: ${deepLink.slice(0, 80)}...`);

    // Verify deep link structure
    assertStartsWith(deepLink, 'https://dflow.net/proof?', 'Deep link base');
    assertContains(deepLink, `wallet=${walletAddress}`, 'Deep link wallet');
    assertContains(deepLink, `timestamp=${timestamp}`, 'Deep link timestamp');
    assertContains(deepLink, 'projectId=test-partner', 'Deep link projectId');

    return {
      initialStatus,
      message,
      deepLink,
    };
  });

  await runner.test('5.2 ProofAPI is accessible from DFlowClient', async () => {
    assertDefined(dflow.proof, 'proof property should exist on client');
    assertDefined(dflow.proof.verifyAddress, 'verifyAddress method should exist');
    assertDefined(dflow.proof.generateSignatureMessage, 'generateSignatureMessage method should exist');
    assertDefined(dflow.proof.buildDeepLink, 'buildDeepLink method should exist');

    return true;
  });

  return true;
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function main(): Promise<void> {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           DFlow SDK - Proof KYC API Test Suite               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Run all phases
    await phase1Constants();
    await phase2SignatureMessage();
    await phase3DeepLink();
    await phase4VerifyAddress();
    await phase5IntegrationFlow();
  } catch (error: any) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }

  // Print summary
  runner.summary();

  // Exit with appropriate code
  if (runner.hasFailures()) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
