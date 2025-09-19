import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { FEATURES } from '@/config/api';

export const APIStatus = () => {
  const statusItems = [
    {
      name: 'Database Connection',
      enabled: FEATURES.database,
      description: 'Supabase database for storing disease information'
    },
    {
      name: 'AI Chat Assistant',
      enabled: FEATURES.aiChat,
      description: 'Google Gemini AI for intelligent health responses'
    },
    {
      name: 'Misinformation Detection',
      enabled: FEATURES.misinformationDetection,
      description: 'AI-powered detection of health misinformation'
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          API Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusItems.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{item.name}</span>
                <Badge variant={item.enabled ? 'default' : 'secondary'}>
                  {item.enabled ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {item.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
        
        {!FEATURES.aiChat && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> To enable AI features, add your Gemini API key to the <code>.env</code> file:
              <br />
              <code className="mt-1 block bg-yellow-100 p-1 rounded">
                VITE_GEMINI_API_KEY="your-api-key-here"
              </code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
