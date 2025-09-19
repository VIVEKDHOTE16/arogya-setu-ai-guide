import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useChatBot } from '@/hooks/useChatBot';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  disease?: any;
  misinformation?: boolean;
  timestamp: Date;
}

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Aarogya Setu health assistant. I can help you with verified medical information about diseases. Ask me about any health condition!',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { searchDisease, logConversation, detectMisinformation, getAIHealthResponse } = useChatBot();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Check for misinformation first
      const misinformationDetected = await detectMisinformation(inputText);
      
      let botResponse = '';
      let botMessage: Message;

      if (misinformationDetected) {
        // Show misinformation correction
        const correctionMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `⚠️ **Misinformation Detected**: ${misinformationDetected.correction}`,
          isBot: true,
          misinformation: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, correctionMessage]);
        botResponse = misinformationDetected.correction;
      } else {
        // Try to find disease in database first
        const disease = await searchDisease(inputText);
        
        if (disease) {
          // Use database information
          botResponse = formatDiseaseResponse(disease);
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            isBot: true,
            disease,
            timestamp: new Date()
          };
        } else {
          // Use AI to generate response
          const aiResponse = await getAIHealthResponse(inputText);
          botResponse = `${aiResponse.response}\n\n---\n${aiResponse.disclaimer}`;
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            isBot: true,
            timestamp: new Date()
          };
        }

        if (botMessage) {
          setMessages(prev => [...prev, botMessage]);
        }
      }

      // Log conversation
      await logConversation(inputText, botResponse, null, misinformationDetected?.id);

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDiseaseResponse = (disease: any) => {
    return `✅ **Disease**: ${disease.disease_name} ${disease.name_hindi ? `(${disease.name_hindi})` : ''}

📌 **Description**: ${disease.description}

⚠️ **Symptoms**: ${disease.symptoms.join(', ')}

💊 **Treatment**: ${disease.treatments.join(', ')}

🌱 **Remedies**: ${disease.remedies?.join(', ') || 'Rest and supportive care'}

🛡️ **Precautions**: ${disease.precautions.join(', ')}

---
**Disclaimer**: This information is verified from WHO/CDC/MoHFW. Always consult a doctor for diagnosis and treatment.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Aarogya Setu Health Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.isBot ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.isBot && (
                  <div className="flex-shrink-0">
                    {message.misinformation ? (
                      <AlertTriangle className="h-8 w-8 p-1.5 bg-destructive/10 text-destructive rounded-full" />
                    ) : (
                      <Bot className="h-8 w-8 p-1.5 bg-primary/10 text-primary rounded-full" />
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot
                      ? message.misinformation
                        ? 'bg-destructive/10 text-destructive-foreground border border-destructive/20'
                        : 'bg-muted'
                      : 'bg-primary text-primary-foreground ml-auto'
                  }`}
                >
                  <div className="whitespace-pre-line text-sm">
                    {message.text}
                  </div>
                  {message.disease && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {message.disease.category}
                      </Badge>
                      <Badge variant={message.disease.severity === 'High' ? 'destructive' : 'default'} className="text-xs">
                        {message.disease.severity}
                      </Badge>
                      {message.disease.who_verified && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          WHO Verified
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {!message.isBot && (
                  <User className="h-8 w-8 p-1.5 bg-secondary text-secondary-foreground rounded-full flex-shrink-0" />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Bot className="h-8 w-8 p-1.5 bg-primary/10 text-primary rounded-full" />
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about any health condition..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputText.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};