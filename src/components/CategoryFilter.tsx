import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Heart, Wind, Utensils, Brain, Shield, Bone, Palette, Droplet, Eye, Baby, Users } from "lucide-react";

interface CategoryFilterProps {
  selectedCategories: string[];
  selectedSeverities: string[];
  onCategoryToggle: (category: string) => void;
  onSeverityToggle: (severity: string) => void;
  onClearFilters: () => void;
  isOpen: boolean;
}

const categories = [
  { name: "Heart", icon: Heart, color: "text-red-500" },
  { name: "Respiratory", icon: Wind, color: "text-blue-500" },
  { name: "Digestive", icon: Utensils, color: "text-orange-500" },
  { name: "Mental", icon: Brain, color: "text-purple-500" },
  { name: "Infectious", icon: Shield, color: "text-yellow-500" },
  { name: "Musculoskeletal", icon: Bone, color: "text-gray-500" },
  { name: "Skin", icon: Palette, color: "text-pink-500" },
  { name: "Endocrine", icon: Droplet, color: "text-green-500" },
  { name: "Eye & Ear", icon: Eye, color: "text-indigo-500" },
  { name: "Blood", icon: Droplet, color: "text-red-600" },
  { name: "Pediatric", icon: Baby, color: "text-cyan-500" },
  { name: "Geriatric", icon: Users, color: "text-slate-500" },
];

const severities = ["Mild", "Moderate", "Severe", "Critical"];

const CategoryFilter = ({
  selectedCategories,
  selectedSeverities,
  onCategoryToggle,
  onSeverityToggle,
  onClearFilters,
  isOpen
}: CategoryFilterProps) => {
  if (!isOpen) return null;

  return (
    <Card className="mb-6 border-2 border-primary/20 shadow-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">फ़िल्टर | Filters</CardTitle>
          <button
            onClick={onClearFilters}
            className="text-sm text-muted-foreground hover:text-primary flex items-center space-x-1"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="font-medium mb-3 text-primary">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategories.includes(category.name);
              return (
                <Badge
                  key={category.name}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    isSelected ? "bg-primary text-white" : "hover:border-primary"
                  }`}
                  onClick={() => onCategoryToggle(category.name)}
                >
                  <Icon className={`h-4 w-4 mr-2 ${category.color}`} />
                  {category.name}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Severity */}
        <div>
          <h3 className="font-medium mb-3 text-primary">Severity Level</h3>
          <div className="flex flex-wrap gap-2">
            {severities.map((severity) => {
              const isSelected = selectedSeverities.includes(severity);
              return (
                <Badge
                  key={severity}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    isSelected ? "bg-secondary text-white" : "hover:border-secondary"
                  }`}
                  onClick={() => onSeverityToggle(severity)}
                >
                  {severity}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilter;