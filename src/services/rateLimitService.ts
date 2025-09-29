// Rate limiting service to prevent API quota exceeded errors
interface RateLimitConfig {
  requestsPerMinute: number;
  dailyQuota: number;
  cooldownPeriod: number; // milliseconds
}

interface RequestRecord {
  timestamp: number;
  count: number;
}

class RateLimitService {
  private config: RateLimitConfig;
  private requestHistory: RequestRecord[] = [];
  private dailyCount: number = 0;
  private lastResetDate: string = '';
  private lastRequestTime: number = 0;
  private consecutiveErrors: number = 0;
  private isInCooldown: boolean = false;

  constructor() {
    this.config = {
      requestsPerMinute: parseInt(import.meta.env.VITE_API_RATE_LIMIT_REQUESTS_PER_MINUTE || '15'),
      dailyQuota: parseInt(import.meta.env.VITE_API_RATE_LIMIT_DAILY_QUOTA || '1000'),
      cooldownPeriod: 60000 // 1 minute cooldown after errors
    };
    
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('gemini_rate_limit');
      if (stored) {
        const data = JSON.parse(stored);
        this.dailyCount = data.dailyCount || 0;
        this.lastResetDate = data.lastResetDate || '';
        this.consecutiveErrors = data.consecutiveErrors || 0;
        
        // Reset daily count if it's a new day
        const today = new Date().toDateString();
        if (this.lastResetDate !== today) {
          this.dailyCount = 0;
          this.lastResetDate = today;
          this.consecutiveErrors = 0;
          this.saveToStorage();
        }
      }
    } catch (error) {
      console.warn('Failed to load rate limit data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        dailyCount: this.dailyCount,
        lastResetDate: this.lastResetDate,
        consecutiveErrors: this.consecutiveErrors
      };
      localStorage.setItem('gemini_rate_limit', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save rate limit data to storage:', error);
    }
  }

  private cleanOldRequests() {
    const oneMinuteAgo = Date.now() - 60000;
    this.requestHistory = this.requestHistory.filter(record => record.timestamp > oneMinuteAgo);
  }

  private getRequestsInLastMinute(): number {
    this.cleanOldRequests();
    return this.requestHistory.reduce((sum, record) => sum + record.count, 0);
  }

  public canMakeRequest(): { allowed: boolean; reason?: string; waitTime?: number } {
    const now = Date.now();

    // Check cooldown period
    if (this.isInCooldown) {
      const cooldownRemaining = this.config.cooldownPeriod - (now - this.lastRequestTime);
      if (cooldownRemaining > 0) {
        return {
          allowed: false,
          reason: 'In cooldown period due to consecutive errors',
          waitTime: cooldownRemaining
        };
      } else {
        this.isInCooldown = false;
        this.consecutiveErrors = 0;
      }
    }

    // Check daily quota
    if (this.dailyCount >= this.config.dailyQuota) {
      return {
        allowed: false,
        reason: 'Daily quota exceeded',
        waitTime: this.getTimeUntilReset()
      };
    }

    // Check per-minute rate limit
    const requestsInLastMinute = this.getRequestsInLastMinute();
    if (requestsInLastMinute >= this.config.requestsPerMinute) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded (requests per minute)',
        waitTime: 60000 - (now - Math.min(...this.requestHistory.map(r => r.timestamp)))
      };
    }

    // Check minimum interval between requests (prevent spam)
    const minInterval = 2000; // 2 seconds minimum between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < minInterval) {
      return {
        allowed: false,
        reason: 'Minimum interval between requests not met',
        waitTime: minInterval - timeSinceLastRequest
      };
    }

    return { allowed: true };
  }

  public recordRequest() {
    const now = Date.now();
    this.requestHistory.push({ timestamp: now, count: 1 });
    this.dailyCount++;
    this.lastRequestTime = now;
    
    // Reset daily count if it's a new day
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.dailyCount = 1;
      this.lastResetDate = today;
    }
    
    this.saveToStorage();
  }

  public recordError(error?: Error) {
    this.consecutiveErrors++;
    
    // Enter cooldown after multiple consecutive errors
    if (this.consecutiveErrors >= 3) {
      this.isInCooldown = true;
      this.lastRequestTime = Date.now();
      console.warn(`Entering cooldown period after ${this.consecutiveErrors} consecutive errors`);
    }
    
    // Check for specific error types
    if (error?.message.includes('quota') || error?.message.includes('limit')) {
      // Quota exceeded - enter longer cooldown
      this.isInCooldown = true;
      this.config.cooldownPeriod = 300000; // 5 minutes for quota errors
      console.warn('API quota/limit error detected, entering extended cooldown');
    }
    
    this.saveToStorage();
  }

  public recordSuccess() {
    this.consecutiveErrors = 0;
    this.isInCooldown = false;
    this.config.cooldownPeriod = 60000; // Reset to normal cooldown
    this.saveToStorage();
  }

  private getTimeUntilReset(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  }

  public getStatus() {
    const requestsInLastMinute = this.getRequestsInLastMinute();
    return {
      dailyCount: this.dailyCount,
      dailyQuota: this.config.dailyQuota,
      requestsInLastMinute,
      requestsPerMinute: this.config.requestsPerMinute,
      consecutiveErrors: this.consecutiveErrors,
      isInCooldown: this.isInCooldown,
      quotaUsagePercentage: Math.round((this.dailyCount / this.config.dailyQuota) * 100)
    };
  }

  public reset() {
    this.requestHistory = [];
    this.dailyCount = 0;
    this.consecutiveErrors = 0;
    this.isInCooldown = false;
    this.lastResetDate = new Date().toDateString();
    this.saveToStorage();
  }
}

export const rateLimitService = new RateLimitService();