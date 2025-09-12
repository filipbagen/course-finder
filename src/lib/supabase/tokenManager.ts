import { createClient } from './client';

/**
 * Simple token refresh manager for client-side auth
 */
class TokenManager {
  private intervalId: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  /**
   * Start the token refresh scheduler
   */
  public start(): void {
    if (this.intervalId) {
      this.stop();
    }

    console.log('TokenManager: Starting token refresh scheduler');

    // Check immediately when started
    this.refreshTokenIfNeeded();

    // Check every 4 minutes
    this.intervalId = setInterval(() => {
      this.refreshTokenIfNeeded();
    }, 4 * 60 * 1000);
  }

  /**
   * Stop the token refresh scheduler
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('TokenManager: Stopped token refresh scheduler');
    }
  }

  /**
   * Check and refresh token if needed
   */
  public async refreshTokenIfNeeded(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }

    try {
      this.isRefreshing = true;

      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        const expiresAt = data.session.expires_at;
        if (expiresAt) {
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = expiresAt - now;

          // If token expires in less than 10 minutes, refresh it
          if (timeUntilExpiry < 600) {
            console.log(
              `TokenManager: Token expires in ${timeUntilExpiry}s, refreshing`
            );

            await supabase.auth.refreshSession();
            console.log('TokenManager: Token refreshed successfully');
          }
        }
      }
    } catch (error) {
      console.error('TokenManager: Error refreshing token', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Force a token refresh
   */
  public async forceRefresh(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }

    try {
      this.isRefreshing = true;

      const supabase = createClient();
      await supabase.auth.refreshSession();

      console.log('TokenManager: Forced token refresh successful');
    } catch (error) {
      console.error('TokenManager: Error during forced refresh', error);
    } finally {
      this.isRefreshing = false;
    }
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();

/**
 * Initialize the token manager
 */
export function initializeTokenManager(): void {
  if (typeof window !== 'undefined') {
    tokenManager.start();

    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        tokenManager.refreshTokenIfNeeded();
      }
    });

    // Add event listener for online status
    window.addEventListener('online', () => {
      tokenManager.refreshTokenIfNeeded();
    });
  }
}
