import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateHealthResponse, isGeminiConfigured } from '@/services/geminiAI';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const GeminiTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const testGeminiAPI = async () => {
    setIsLoading(true);
    setTestResult(null);
    setIsSuccess(null);

    try {
      const response = await generateHealthResponse("What is fever?");
      
      if (response.response.includes("error") || response.response.includes("unavailable")) {
        setIsSuccess(false);
        setTestResult(response.response);
      } else {
        setIsSuccess(true);
        setTestResult("✅ Gemini API is working! Test response received successfully.");
      }
    } catch (error) {
      setIsSuccess(false);
      setTestResult(`❌ API Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const configured = isGeminiConfigured();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {configured ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          Gemini API Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Configuration Status: {configured ? "✅ API Key Found" : "❌ API Key Missing"}
          </AlertDescription>
        </Alert>

        <Button 
          onClick={testGeminiAPI} 
          disabled={!configured || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing API...
            </>
          ) : (
            'Test Gemini API'
          )}
        </Button>

        {testResult && (
          <Alert variant={isSuccess ? "default" : "destructive"}>
            <AlertDescription>
              {testResult}
            </AlertDescription>
          </Alert>
        )}

        {!configured && (
          <Alert>
            <AlertDescription>
              <strong>Setup Required:</strong>
              <br />
              1. Add your Gemini API key to the .env file:
              <br />
              <code className="bg-gray-100 p-1 rounded text-sm">
                VITE_GEMINI_API_KEY="your-api-key-here"
              </code>
              <br />
              2. Restart the development server
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
