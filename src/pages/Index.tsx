import { useState, useMemo } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import DiseaseCard from "@/components/DiseaseCard";
import DiseaseModal from "@/components/DiseaseModal";
import { sampleDiseases } from "@/data/sampleDiseases";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Users, Search, Filter } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter diseases based on search and filters
  const filteredDiseases = useMemo(() => {
    return sampleDiseases.filter((disease) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disease.nameHindi.includes(searchQuery) ||
        disease.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disease.commonSymptoms.some(symptom => 
          symptom.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(disease.category);

      // Severity filter
      const matchesSeverity = selectedSeverities.length === 0 || 
        selectedSeverities.includes(disease.severity);

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [searchQuery, selectedCategories, selectedSeverities]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSeverityToggle = (severity: string) => {
    setSelectedSeverities(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSeverities([]);
    setSearchQuery("");
  };

  const handleDiseaseClick = (disease: any) => {
    setSelectedDisease(disease);
    setIsModalOpen(true);
  };

  const activeFiltersCount = selectedCategories.length + selectedSeverities.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Comprehensive Health Information System
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              व्यापक स्वास्थ्य जानकारी प्रणाली | Access detailed information about 1000+ diseases, symptoms, treatments, and prevention
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <span>1000+ Diseases</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-secondary" />
                <span>English + Hindi</span>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-primary" />
                <span>Advanced Search</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="mb-8">
          <SearchBar 
            onSearch={setSearchQuery}
            onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
          />
          
          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Active Filters:</span>
              {selectedCategories.map(category => (
                <Badge key={category} variant="default" className="text-xs">
                  {category}
                </Badge>
              ))}
              {selectedSeverities.map(severity => (
                <Badge key={severity} variant="secondary" className="text-xs">
                  {severity}
                </Badge>
              ))}
              <button
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground hover:text-primary underline"
              >
                Clear all
              </button>
            </div>
          )}

          <CategoryFilter
            selectedCategories={selectedCategories}
            selectedSeverities={selectedSeverities}
            onCategoryToggle={handleCategoryToggle}
            onSeverityToggle={handleSeverityToggle}
            onClearFilters={handleClearFilters}
            isOpen={isFilterOpen}
          />
        </section>

        {/* Results Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-primary">
              Disease Database
              <span className="text-sm text-muted-foreground font-normal ml-2">
                ({filteredDiseases.length} results)
              </span>
            </h3>
          </div>

          {filteredDiseases.length === 0 ? (
            <Card className="text-center py-12 border-2 border-dashed border-muted">
              <CardContent>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-2">No diseases found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDiseases.map((disease) => (
                <DiseaseCard
                  key={disease.id}
                  disease={disease}
                  onClick={() => handleDiseaseClick(disease)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Footer Info */}
        <section className="mt-16 text-center">
          <Card className="bg-muted/30 border-primary/20">
            <CardContent className="py-8">
              <h4 className="text-lg font-semibold text-primary mb-3">
                Important Medical Disclaimer
              </h4>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                <strong>Arogya Setu AI</strong> provides educational health information only. 
                This is not a substitute for professional medical advice, diagnosis, or treatment. 
                Always consult qualified healthcare providers for medical concerns.
                <br /><br />
                <strong>चिकित्सा अस्वीकरण:</strong> यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। 
                हमेशा योग्य चिकित्सकों से सलाह लें।
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Disease Detail Modal */}
      <DiseaseModal
        disease={selectedDisease}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDisease(null);
        }}
      />
    </div>
  );
};

export default Index;
