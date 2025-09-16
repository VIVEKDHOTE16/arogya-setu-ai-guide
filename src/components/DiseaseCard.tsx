import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, AlertTriangle, Activity, Thermometer } from "lucide-react";

interface Disease {
  id: string;
  name: string;
  nameHindi: string;
  category: string;
  severity: "Mild" | "Moderate" | "Severe" | "Critical";
  description: string;
  commonSymptoms: string[];
  prevalence: string;
}

interface DiseaseCardProps {
  disease: Disease;
  onClick: () => void;
}

const DiseaseCard = ({ disease, onClick }: DiseaseCardProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Mild":
        return <Activity className="h-4 w-4" />;
      case "Moderate":
        return <Thermometer className="h-4 w-4" />;
      case "Severe":
        return <AlertTriangle className="h-4 w-4" />;
      case "Critical":
        return <Heart className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Mild":
        return "severity-mild";
      case "Moderate":
        return "severity-moderate";
      case "Severe":
        return "severity-severe";
      case "Critical":
        return "severity-critical";
      default:
        return "severity-mild";
    }
  };

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-float hover:scale-[1.02] card-gradient border-2 border-border hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="text-xs">
            {disease.category}
          </Badge>
          <div className={`flex items-center space-x-1 ${getSeverityColor(disease.severity)}`}>
            {getSeverityIcon(disease.severity)}
            <span className="text-xs font-medium">{disease.severity}</span>
          </div>
        </div>
        <CardTitle className="text-lg leading-tight">
          <div className="text-primary font-semibold">{disease.name}</div>
          <div className="text-sm text-muted-foreground font-normal mt-1">
            {disease.nameHindi}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {disease.description}
        </p>
        {disease.commonSymptoms.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-foreground mb-1">Common Symptoms:</p>
            <div className="flex flex-wrap gap-1">
              {disease.commonSymptoms.slice(0, 3).map((symptom, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {symptom}
                </Badge>
              ))}
              {disease.commonSymptoms.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{disease.commonSymptoms.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          Prevalence: {disease.prevalence}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiseaseCard;