import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Zap, RefreshCw } from 'lucide-react';
import { getApiStatus, resetRateLimits } from '@/services/geminiAI';

export const ApiStatusCard = () => {
  const [status, setStatus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const apiStatus = getApiStatus();
      setStatus(apiStatus);
    } catch (error) {
      console.error('Failed to get API status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetRateLimits = () => {
    resetRateLimits();
    refreshStatus();
  };

  useEffect(() => {
    refreshStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading API status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { configured, rateLimitStatus, model, keyPrefix } = status;
  const quotaColor = rateLimitStatus.quotaUsagePercentage > 90 ? 'destructive' : 
                    rateLimitStatus.quotaUsagePercentage > 70 ? 'warning' : 'success';

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            API Status
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatus}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {configured ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              Gemini AI {configured ? 'Connected' : 'Not Configured'}
            </span>
          </div>
          <Badge variant={configured ? 'default' : 'destructive'}>
            {model}
          </Badge>
        </div>

        {configured && (
          <>
            {/* API Key Info */}
            <div className="text-xs text-muted-foreground">
              API Key: {keyPrefix}
            </div>

            {/* Rate Limit Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Daily Quota Usage</span>
                <span className="text-sm text-muted-foreground">
                  {rateLimitStatus.dailyCount} / {rateLimitStatus.dailyQuota}
                </span>
              </div>
              
              <Progress 
                value={rateLimitStatus.quotaUsagePercentage} 
                className={`w-full h-2 ${quotaColor === 'destructive' ? 'bg-red-100' : 
                  quotaColor === 'warning' ? 'bg-yellow-100' : 'bg-green-100'}`}
              />
              
              <div className="text-xs text-muted-foreground">
                {rateLimitStatus.quotaUsagePercentage}% used today
              </div>
            </div>

            {/* Rate Limiting Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Requests/Minute</div>
                <div className="text-muted-foreground">
                  {rateLimitStatus.requestsInLastMinute} / {rateLimitStatus.requestsPerMinute}
                </div>
              </div>
              <div>
                <div className="font-medium">Consecutive Errors</div>
                <div className="text-muted-foreground">
                  {rateLimitStatus.consecutiveErrors}
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap gap-2">
              {rateLimitStatus.isInCooldown && (
                <Badge variant="destructive" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  In Cooldown
                </Badge>
              )}
              
              {rateLimitStatus.quotaUsagePercentage > 90 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Quota Almost Full
                </Badge>
              )}
              
              {rateLimitStatus.quotaUsagePercentage < 50 && rateLimitStatus.consecutiveErrors === 0 && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              )}
            </div>

            {/* Reset Button (for development/testing) */}
            {(rateLimitStatus.isInCooldown || rateLimitStatus.consecutiveErrors > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetRateLimits}
                className="w-full text-xs"
              >
                Reset Rate Limits (Development)
              </Button>
            )}
          </>
        )}

        {!configured && (
          <div className="text-sm text-muted-foreground">
            Please configure your Gemini API key in the environment variables to enable AI features.
          </div>
        )}
      </CardContent>
    </Card>
  );
};