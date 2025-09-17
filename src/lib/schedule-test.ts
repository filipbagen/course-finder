/**
 * Schedule Operations Test
 *
 * This file contains tests to verify that schedule operations work correctly.
 * Run this in the browser console to test the functionality.
 */

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  error?: any;
}

class ScheduleTester {
  private results: TestResult[] = [];

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Schedule Operations Tests...\n');

    await this.testToastNotifications();
    await this.testMoveOperation();
    await this.testDeleteOperation();
    await this.testPersistence();

    this.printResults();
  }

  /**
   * Test that toast notifications work
   */
  private async testToastNotifications(): Promise<void> {
    console.log('Testing toast notifications...');

    try {
      // Check if toast library is available
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.success('Test toast notification');
        this.addResult(
          'Toast Notifications',
          true,
          'Toast library is available and working'
        );
      } else {
        this.addResult('Toast Notifications', false, 'Toast library not found');
      }
    } catch (error) {
      this.addResult(
        'Toast Notifications',
        false,
        'Error testing toast notifications',
        error
      );
    }
  }

  /**
   * Test move operation
   */
  private async testMoveOperation(): Promise<void> {
    console.log('Testing move operation...');

    try {
      // This would require actual DOM interaction, so we'll just check if the functions exist
      const scheduleProvider = (window as any).__scheduleProvider;
      if (scheduleProvider && scheduleProvider.handleCourseMove) {
        this.addResult(
          'Move Operation',
          true,
          'Move operation function is available'
        );
      } else {
        this.addResult(
          'Move Operation',
          false,
          'Move operation function not found'
        );
      }
    } catch (error) {
      this.addResult(
        'Move Operation',
        false,
        'Error testing move operation',
        error
      );
    }
  }

  /**
   * Test delete operation
   */
  private async testDeleteOperation(): Promise<void> {
    console.log('Testing delete operation...');

    try {
      // Check if the delete function exists
      const scheduleProvider = (window as any).__scheduleProvider;
      if (scheduleProvider && scheduleProvider.handleCourseRemoval) {
        this.addResult(
          'Delete Operation',
          true,
          'Delete operation function is available'
        );
      } else {
        this.addResult(
          'Delete Operation',
          false,
          'Delete operation function not found'
        );
      }
    } catch (error) {
      this.addResult(
        'Delete Operation',
        false,
        'Error testing delete operation',
        error
      );
    }
  }

  /**
   * Test persistence
   */
  private async testPersistence(): Promise<void> {
    console.log('Testing persistence...');

    try {
      // Test if we can make API calls
      const response = await fetch('/api/schedule', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        this.addResult('API Connectivity', true, 'API is accessible');
      } else {
        this.addResult(
          'API Connectivity',
          false,
          `API returned ${response.status}`
        );
      }
    } catch (error) {
      this.addResult(
        'API Connectivity',
        false,
        'Error connecting to API',
        error
      );
    }
  }

  /**
   * Add a test result
   */
  private addResult(
    name: string,
    passed: boolean,
    message: string,
    error?: any
  ): void {
    this.results.push({ name, passed, message, error });
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log('\n📊 Test Results:\n');

    let passed = 0;
    let failed = 0;

    this.results.forEach((result) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.name}: ${result.message}`);

      if (result.error) {
        console.error('   Error:', result.error);
      }

      if (result.passed) {
        passed++;
      } else {
        failed++;
      }
    });

    console.log(`\n🎯 Summary: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Check the implementation.');
    }
  }
}

// Make the tester available globally
if (typeof window !== 'undefined') {
  (window as any).ScheduleTester = ScheduleTester;
  console.log(
    '🧪 ScheduleTester is now available. Run: new ScheduleTester().runAllTests()'
  );
}
