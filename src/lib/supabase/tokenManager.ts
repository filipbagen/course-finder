import {
  checkAuthStatus,
  refreshSupabaseSession,
  resetSupabaseClient,
} from './client';

/**
 * Token refresh scheduler that handles automatic token refreshing
 * This utility helps prevent token expiration issues across the application
 */
class TokenRefreshScheduler {
  private static instance: TokenRefreshScheduler;
  private intervalId: NodeJS.Timeout | null = null;
  private lastRefreshTime: number = 0;
  private refreshInProgress: boolean = false;

  // Private constructor (singleton pattern)
  private constructor() {}

  // Get the singleton instance
  public static getInstance(): TokenRefreshScheduler {
    if (!TokenRefreshScheduler.instance) {
      TokenRefreshScheduler.instance = new TokenRefreshScheduler();
    }
    return TokenRefreshScheduler.instance;
  }

  /**
   * Start the token refresh scheduler
   * @param intervalMinutes How often to check token expiration (in minutes)
   */
  public start(intervalMinutes: number = 5): void {
    // Don't start multiple intervals
    if (this.intervalId) {
      this.stop();
    }

    console.log(
      `TokenManager: Starting refresh scheduler (interval: ${intervalMinutes} minutes)`
    );

    // Run an immediate check
    this.checkAndRefreshToken();

    // Schedule regular checks
    this.intervalId = setInterval(() => {
      this.checkAndRefreshToken();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop the token refresh scheduler
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('TokenManager: Stopped refresh scheduler');
    }
  }

  /**
   * Check if the token is valid and refresh if needed
   */
  public async checkAndRefreshToken(): Promise<boolean> {
    // Prevent concurrent refresh operations
    if (this.refreshInProgress) {
      console.log('TokenManager: Refresh already in progress, skipping');
      return false;
    }

    try {
      this.refreshInProgress = true;

      // Throttle refreshes (don't refresh more than once every 2 minutes)
      const now = Date.now();
      const timeSinceLastRefresh = now - this.lastRefreshTime;
      if (timeSinceLastRefresh < 2 * 60 * 1000) {
        console.log(
          `TokenManager: Last refresh was ${Math.round(
            timeSinceLastRefresh / 1000
          )}s ago, skipping`
        );
        return false;
      }

      // Check current auth status
      const status = await checkAuthStatus();

      // If not authenticated, no need to refresh
      if (!status.isAuthenticated) {
        return false;
      }

      // Check if token is close to expiry
      if (status.expiresAt) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = status.expiresAt - currentTime;

        // If token expires in less than 10 minutes, refresh it
        if (timeUntilExpiry < 600) {
          console.log(
            `TokenManager: Token expires in ${timeUntilExpiry}s, refreshing`
          );

          // Refresh the token
          const refreshResult = await refreshSupabaseSession();

          if (refreshResult.success) {
            console.log('TokenManager: Token refreshed successfully');
            this.lastRefreshTime = Date.now();
            return true;
          } else {
            console.error(
              'TokenManager: Token refresh failed',
              refreshResult.error
            );

            // Try to reset client as a last resort
            resetSupabaseClient();
            return false;
          }
        } else {
          console.log(
            `TokenManager: Token valid for ${Math.floor(
              timeUntilExpiry / 60
            )} more minutes, no refresh needed`
          );
        }
      }

      return false;
    } catch (error) {
      console.error('TokenManager: Error in checkAndRefreshToken', error);
      return false;
    } finally {
      this.refreshInProgress = false;
    }
  }

  /**
   * Force an immediate token refresh
   */
  public async forceRefresh(): Promise<boolean> {
    if (this.refreshInProgress) {
      console.log('TokenManager: Refresh already in progress, waiting...');

      // Wait for current refresh to finish (max 5 seconds)
      let waitCount = 0;
      while (this.refreshInProgress && waitCount < 50) {
        await new Promise((r) => setTimeout(r, 100));
        waitCount++;
      }

      if (this.refreshInProgress) {
        console.log(
          'TokenManager: Timed out waiting for current refresh to finish'
        );
        return false;
      }
    }

    try {
      this.refreshInProgress = true;
      console.log('TokenManager: Forcing token refresh');

      const refreshResult = await refreshSupabaseSession();

      if (refreshResult.success) {
        console.log('TokenManager: Forced token refresh successful');
        this.lastRefreshTime = Date.now();
        return true;
      } else {
        console.error(
          'TokenManager: Forced token refresh failed',
          refreshResult.error
        );
        return false;
      }
    } catch (error) {
      console.error('TokenManager: Error in forceRefresh', error);
      return false;
    } finally {
      this.refreshInProgress = false;
    }
  }
}

// Export the singleton instance
export const tokenManager = TokenRefreshScheduler.getInstance();

/**
 * Initialize the token manager in client-side code
 * Call this function early in your application's lifecycle
 */
export function initializeTokenManager(): void {
  if (typeof window !== 'undefined') {
    // Start checking tokens every 5 minutes
    tokenManager.start(5);

    // Add event listeners for tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('TokenManager: Tab became visible, checking token');
        tokenManager.checkAndRefreshToken();
      }
    });

    // Add event listener for online status changes
    window.addEventListener('online', () => {
      console.log('TokenManager: Browser came online, checking token');
      tokenManager.checkAndRefreshToken();
    });
  }
}
