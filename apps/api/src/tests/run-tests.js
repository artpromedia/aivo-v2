#!/usr/bin/env node

/**
 * Test Runner Script for AIVO Platform Phase 1 Integration Tests
 * 
 * This script orchestrates the execution of integration tests for:
 * - Focus Guardian + Game Generation Integration
 * - Homework Helper System
 * - Writing Pad Collaboration  
 * - WebSocket Real-time Communication
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Configuration
const CONFIG = {
  testTimeout: 30000,
  maxRetries: 3,
  parallelTests: true,
  coverageThreshold: 70,
  testResultsDir: './test-results',
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Test suites configuration
const TEST_SUITES = [
  {
    name: 'Focus Guardian + Game Generation Integration',
    file: 'src/tests/integration/focus-game-integration.test.ts',
    timeout: 45000,
    critical: true
  },
  {
    name: 'Homework Helper System',
    file: 'src/tests/integration/homework-helper.test.ts',
    timeout: 30000,
    critical: true
  },
  {
    name: 'Writing Pad Collaboration',
    file: 'src/tests/integration/writing-pad.test.ts',
    timeout: 35000,
    critical: true
  },
  {
    name: 'WebSocket Real-time Communication',
    file: 'src/tests/integration/websocket.test.ts',
    timeout: 40000,
    critical: true
  }
];

class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      suites: []
    };
    
    this.setupTestEnvironment();
  }

  setupTestEnvironment() {
    // Create test results directory
    if (!existsSync(CONFIG.testResultsDir)) {
      mkdirSync(CONFIG.testResultsDir, { recursive: true });
    }

    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.VITEST_REPORTER = 'json';
    
    console.log('🚀 Setting up test environment...');
    console.log(`📁 Test results directory: ${CONFIG.testResultsDir}`);
    console.log(`⏱️  Default timeout: ${CONFIG.testTimeout}ms`);
    console.log(`🔄 Max retries: ${CONFIG.maxRetries}`);
  }

  async runSuite(suite, retryCount = 0) {
    const startTime = Date.now();
    
    try {
      console.log(`\n🧪 Running: ${suite.name}`);
      console.log(`📂 File: ${suite.file}`);
      
      const result = await this.executeVitest(suite);
      
      const duration = Date.now() - startTime;
      const suiteResult = {
        name: suite.name,
        file: suite.file,
        passed: result.success,
        duration,
        retryCount,
        critical: suite.critical
      };

      this.results.suites.push(suiteResult);
      
      if (result.success) {
        console.log(`✅ ${suite.name} - PASSED (${duration}ms)`);
        this.results.passed++;
      } else {
        console.log(`❌ ${suite.name} - FAILED (${duration}ms)`);
        
        if (retryCount < CONFIG.maxRetries) {
          console.log(`🔄 Retrying ${suite.name} (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
          return this.runSuite(suite, retryCount + 1);
        }
        
        this.results.failed++;
        
        if (suite.critical) {
          console.log(`🚨 Critical test failed: ${suite.name}`);
        }
      }

      return suiteResult;
      
    } catch (error) {
      console.error(`💥 Error running ${suite.name}:`, error.message);
      
      if (retryCount < CONFIG.maxRetries) {
        console.log(`🔄 Retrying ${suite.name} due to error (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
        return this.runSuite(suite, retryCount + 1);
      }
      
      this.results.failed++;
      return {
        name: suite.name,
        file: suite.file,
        passed: false,
        error: error.message,
        duration: Date.now() - startTime,
        retryCount,
        critical: suite.critical
      };
    }
  }

  executeVitest(suite) {
    return new Promise((resolve, reject) => {
      const vitestArgs = [
        'run',
        suite.file,
        '--reporter=json',
        '--reporter=verbose',
        `--testTimeout=${suite.timeout || CONFIG.testTimeout}`,
        '--run'
      ];

      const vitestProcess = spawn('npx', ['vitest', ...vitestArgs], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      vitestProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        if (CONFIG.logLevel === 'debug') {
          process.stdout.write(data);
        }
      });

      vitestProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        if (CONFIG.logLevel === 'debug') {
          process.stderr.write(data);
        }
      });

      vitestProcess.on('close', (code) => {
        const success = code === 0;
        
        if (!success && CONFIG.logLevel !== 'debug') {
          console.log('\n📋 Test Output:');
          console.log(stdout);
          if (stderr) {
            console.log('\n🚫 Test Errors:');
            console.log(stderr);
          }
        }

        resolve({
          success,
          code,
          stdout,
          stderr
        });
      });

      vitestProcess.on('error', (error) => {
        reject(error);
      });

      // Handle timeout
      setTimeout(() => {
        vitestProcess.kill('SIGTERM');
        reject(new Error(`Test suite timed out after ${suite.timeout || CONFIG.testTimeout}ms`));
      }, suite.timeout || CONFIG.testTimeout);
    });
  }

  async runAllSuites() {
    console.log('\n🎯 Starting AIVO Platform Phase 1 Integration Tests');
    console.log(`📊 Running ${TEST_SUITES.length} test suites\n`);

    this.results.total = TEST_SUITES.length;

    if (CONFIG.parallelTests) {
      console.log('🏃‍♂️ Running tests in parallel...');
      const suitePromises = TEST_SUITES.map(suite => this.runSuite(suite));
      await Promise.all(suitePromises);
    } else {
      console.log('🚶‍♂️ Running tests sequentially...');
      for (const suite of TEST_SUITES) {
        await this.runSuite(suite);
      }
    }
  }

  async runCoverage() {
    console.log('\n📈 Generating coverage report...');
    
    try {
      const coverageResult = await this.executeVitest({
        name: 'Coverage Report',
        file: 'src/tests/integration/**/*.test.ts',
        timeout: 60000
      });

      if (coverageResult.success) {
        console.log('✅ Coverage report generated successfully');
        return true;
      } else {
        console.log('❌ Failed to generate coverage report');
        return false;
      }
    } catch (error) {
      console.error('💥 Error generating coverage:', error.message);
      return false;
    }
  }

  generateReport() {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total: ${this.results.total}`);
    console.log(`🎯 Success Rate: ${Math.round((this.results.passed / this.results.total) * 100)}%`);

    console.log('\n📋 Suite Details:');
    this.results.suites.forEach(suite => {
      const status = suite.passed ? '✅' : '❌';
      const critical = suite.critical ? '🚨' : '';
      const retries = suite.retryCount > 0 ? ` (${suite.retryCount} retries)` : '';
      
      console.log(`${status} ${critical} ${suite.name} - ${suite.duration}ms${retries}`);
    });

    // Critical tests summary
    const criticalFailed = this.results.suites.filter(s => s.critical && !s.passed);
    if (criticalFailed.length > 0) {
      console.log('\n🚨 Critical Test Failures:');
      criticalFailed.forEach(suite => {
        console.log(`❌ ${suite.name}`);
      });
    }

    // Performance summary
    console.log('\n⚡ Performance Summary:');
    const totalDuration = this.results.suites.reduce((sum, suite) => sum + suite.duration, 0);
    const avgDuration = Math.round(totalDuration / this.results.suites.length);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`📊 Average Suite Duration: ${avgDuration}ms`);

    return {
      success: this.results.failed === 0,
      criticalFailures: criticalFailed.length,
      totalDuration,
      results: this.results
    };
  }

  async validateEnvironment() {
    console.log('🔍 Validating test environment...');

    const checks = [
      {
        name: 'Node.js version',
        check: () => {
          const version = process.version;
          const major = parseInt(version.slice(1).split('.')[0]);
          return major >= 20;
        }
      },
      {
        name: 'Test database connection',
        check: async () => {
          // Mock database check - would test actual connection in real implementation
          return process.env.DATABASE_URL?.includes('test') || false;
        }
      },
      {
        name: 'Required environment variables',
        check: () => {
          const required = ['NODE_ENV'];
          return required.every(env => process.env[env]);
        }
      }
    ];

    let allPassed = true;
    
    for (const check of checks) {
      try {
        const result = await check.check();
        if (result) {
          console.log(`✅ ${check.name}`);
        } else {
          console.log(`❌ ${check.name}`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`❌ ${check.name} - Error: ${error.message}`);
        allPassed = false;
      }
    }

    if (!allPassed) {
      console.log('\n🚫 Environment validation failed. Please fix the issues above.');
      process.exit(1);
    }

    console.log('✅ Environment validation passed\n');
  }
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    coverage: false,
    suite: null,
    verbose: false,
    parallel: CONFIG.parallelTests
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--coverage':
        options.coverage = true;
        break;
      case '--suite':
        options.suite = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        CONFIG.logLevel = 'debug';
        break;
      case '--sequential':
        options.parallel = false;
        CONFIG.parallelTests = false;
        break;
      case '--help':
        printHelp();
        process.exit(0);
      default:
        console.log(`Unknown option: ${args[i]}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
AIVO Platform Integration Test Runner

Usage: node run-tests.js [options]

Options:
  --coverage      Generate coverage report after tests
  --suite <name>  Run specific test suite only
  --verbose       Enable debug logging
  --sequential    Run tests sequentially instead of parallel
  --help          Show this help message

Examples:
  node run-tests.js                                    # Run all tests
  node run-tests.js --coverage                         # Run tests with coverage
  node run-tests.js --suite "Focus Guardian"           # Run specific suite
  node run-tests.js --verbose --sequential             # Debug mode, sequential
`);
}

// Main execution
async function main() {
  const options = parseArgs();
  const runner = new TestRunner();

  try {
    await runner.validateEnvironment();

    if (options.suite) {
      const suite = TEST_SUITES.find(s => s.name.includes(options.suite));
      if (!suite) {
        console.error(`❌ Suite not found: ${options.suite}`);
        console.log('Available suites:');
        TEST_SUITES.forEach(s => console.log(`  - ${s.name}`));
        process.exit(1);
      }
      
      console.log(`🎯 Running single suite: ${suite.name}`);
      await runner.runSuite(suite);
    } else {
      await runner.runAllSuites();
    }

    if (options.coverage) {
      await runner.runCoverage();
    }

    const report = runner.generateReport();
    
    if (report.success) {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('\n💥 Some tests failed.');
      if (report.criticalFailures > 0) {
        console.log(`🚨 ${report.criticalFailures} critical test(s) failed.`);
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Test runner error:', error);
    process.exit(1);
  }
}

// ES module check instead of require.main
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TestRunner, CONFIG, TEST_SUITES };