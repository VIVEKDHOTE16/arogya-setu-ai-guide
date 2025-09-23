import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Shield, AlertTriangle } from 'lucide-react';
import { geolocationService, LocationData } from '@/services/geolocation';

interface LocationConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: (consented: boolean, location?: LocationData) => void;
}

export const LocationConsentDialog: React.FC<LocationConsentDialogProps> = ({
  open,
  onOpenChange,
  onConsent
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleAllow = async () => {
    if (!agreedToTerms) return;

    setIsGettingLocation(true);
    try {
      const location = await geolocationService.getCurrentPosition();
      onConsent(true, location);
      onOpenChange(false);
    } catch (error) {
      console.error('Location error:', error);
      onConsent(false);
      onOpenChange(false);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleDeny = () => {
    onConsent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Location Access for Regional Analysis
          </DialogTitle>
          <DialogDescription className="space-y-3 text-left">
            <p>
              We'd like to use your location to improve our misinformation tracking and provide better regional health insights.
            </p>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-1">
                <Shield className="h-4 w-4" />
                How we use your location:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Track misinformation patterns by region</li>
                <li>• Show nearby health misinformation alerts</li>
                <li>• Improve health information for your area</li>
                <li>• Generate anonymous regional statistics</li>
              </ul>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Your privacy is protected:
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Location data is anonymized</li>
                <li>• No personal identification stored</li>
                <li>• Used only for health research</li>
                <li>• You can opt out anytime</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Your exact location is never shared. Only city/state level data is used for analysis.
                </span>
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label 
              htmlFor="terms" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand and agree to anonymous location tracking for health research
            </label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleDeny}
            className="w-full sm:w-auto"
          >
            No Thanks
          </Button>
          <Button 
            onClick={handleAllow}
            disabled={!agreedToTerms || isGettingLocation}
            className="w-full sm:w-auto"
          >
            {isGettingLocation ? (
              <>
                <MapPin className="h-4 w-4 mr-2 animate-pulse" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Allow Location Access
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};