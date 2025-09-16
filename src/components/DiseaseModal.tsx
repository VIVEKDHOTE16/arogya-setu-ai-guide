import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, 
  AlertTriangle, 
  Activity, 
  Thermometer, 
  Shield, 
  Stethoscope, 
  Pill, 
  Users,
  Info,
  Clock
} from "lucide-react";

interface Disease {
  id: string;
  name: string;
  nameHindi: string;
  category: string;
  severity: "Mild" | "Moderate" | "Severe" | "Critical";
  description: string;
  commonSymptoms: string[];
  causes: string[];
  prevention: string[];
  treatment: string[];
  whenToSeeDoctor: string[];
  urgentCare: string[];
  prevalence: string;
  relatedDiseases: string[];
}

interface DiseaseModalProps {
  disease: Disease | null;
  isOpen: boolean;
  onClose: () => void;
}

const DiseaseModal = ({ disease, isOpen, onClose }: DiseaseModalProps) => {
  if (!disease) return null;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Mild":
        return <Activity className="h-5 w-5 text-severity-mild" />;
      case "Moderate":
        return <Thermometer className="h-5 w-5 text-severity-moderate" />;
      case "Severe":
        return <AlertTriangle className="h-5 w-5 text-severity-severe" />;
      case "Critical":
        return <Heart className="h-5 w-5 text-severity-critical" />;
      default:
        return <Activity className="h-5 w-5 text-severity-mild" />;
    }
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl text-primary font-bold">
                {disease.name}
              </DialogTitle>
              <p className="text-lg text-muted-foreground mt-1">{disease.nameHindi}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                {disease.category}
              </Badge>
              <div className="flex items-center space-x-2">
                {getSeverityIcon(disease.severity)}
                <span className="font-medium">{disease.severity}</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Description */}
            <Section title="Description | विवरण" icon={Info}>
              <p className="text-muted-foreground leading-relaxed">{disease.description}</p>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Prevalence:</strong> {disease.prevalence}
                </p>
              </div>
            </Section>

            <Separator />

            {/* Symptoms */}
            <Section title="Common Symptoms | सामान्य लक्षण" icon={Stethoscope}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {disease.commonSymptoms.map((symptom, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{symptom}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Separator />

            {/* Causes */}
            {disease.causes.length > 0 && (
              <>
                <Section title="Causes | कारण" icon={AlertTriangle}>
                  <div className="grid grid-cols-1 gap-2">
                    {disease.causes.map((cause, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2">
                        <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                        <span className="text-sm">{cause}</span>
                      </div>
                    ))}
                  </div>
                </Section>
                <Separator />
              </>
            )}

            {/* Prevention */}
            {disease.prevention.length > 0 && (
              <>
                <Section title="Prevention | रोकथाम" icon={Shield}>
                  <div className="grid grid-cols-1 gap-2">
                    {disease.prevention.map((prev, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-success/10 rounded-lg">
                        <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                        <span className="text-sm">{prev}</span>
                      </div>
                    ))}
                  </div>
                </Section>
                <Separator />
              </>
            )}

            {/* Treatment */}
            {disease.treatment.length > 0 && (
              <>
                <Section title="Treatment | उपचार" icon={Pill}>
                  <div className="grid grid-cols-1 gap-2">
                    {disease.treatment.map((treat, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-primary/10 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <span className="text-sm">{treat}</span>
                      </div>
                    ))}
                  </div>
                </Section>
                <Separator />
              </>
            )}

            {/* When to See Doctor */}
            {disease.whenToSeeDoctor.length > 0 && (
              <>
                <Section title="When to See a Doctor | डॉक्टर से कब मिलें" icon={Clock}>
                  <div className="grid grid-cols-1 gap-2">
                    {disease.whenToSeeDoctor.map((when, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-warning/10 rounded-lg">
                        <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                        <span className="text-sm">{when}</span>
                      </div>
                    ))}
                  </div>
                </Section>
                <Separator />
              </>
            )}

            {/* Urgent Care */}
            {disease.urgentCare.length > 0 && (
              <>
                <Section title="Urgent Care Warning Signs | आपातकालीन चेतावनी" icon={AlertTriangle}>
                  <div className="grid grid-cols-1 gap-2">
                    {disease.urgentCare.map((urgent, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-1 flex-shrink-0" />
                        <span className="text-sm font-medium">{urgent}</span>
                      </div>
                    ))}
                  </div>
                </Section>
                <Separator />
              </>
            )}

            {/* Related Diseases */}
            {disease.relatedDiseases.length > 0 && (
              <Section title="Related Conditions | संबंधित रोग" icon={Users}>
                <div className="flex flex-wrap gap-2">
                  {disease.relatedDiseases.map((related, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {related}
                    </Badge>
                  ))}
                </div>
              </Section>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-muted/50 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. 
                Always consult with healthcare professionals for proper diagnosis and treatment.
                <br />
                <strong>अस्वीकरण:</strong> यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है।
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DiseaseModal;