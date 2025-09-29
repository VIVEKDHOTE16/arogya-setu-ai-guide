import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Star, Phone, CheckCircle, AlertTriangle, Shield, Pill, Home, Clock, MapPin, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { diseaseService, Disease } from '@/services/diseaseService';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['All', 'Infectious', 'Chronic', 'Seasonal', 'Lifestyle', 'Others'];

export const DiseaseInfo = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();

  // Initialize disease data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitializing(true);
        await diseaseService.initializeDiseaseData();
      } catch (error) {
        console.error('Failed to initialize disease data:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize disease database',
          variant: 'destructive'
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeData();
  }, [toast]);

  const { data: diseases = [], isLoading } = useQuery({
    queryKey: ['diseases', selectedCategory],
    queryFn: async () => {
      return await diseaseService.getAllDiseases({
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
    },
    enabled: !isInitializing
  });

  const { data: featuredDiseases = [] } = useQuery({
    queryKey: ['featured-diseases'],
    queryFn: async () => {
      return await diseaseService.getFeaturedDiseases();
    },
    enabled: !isInitializing
  });

  const { data: categories = CATEGORIES } = useQuery({
    queryKey: ['disease-categories'],
    queryFn: async () => {
      return await diseaseService.getCategories();
    },
    enabled: !isInitializing
  });

  const filteredDiseases = useMemo(() => {
    return diseases.filter(disease => {
      const matchesSearch = disease.disease_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           disease.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           disease.symptoms.some((symptom: string) => 
                             symptom.toLowerCase().includes(searchQuery.toLowerCase())
                           );
      
      const matchesCategory = selectedCategory === 'All' || disease.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [diseases, searchQuery, selectedCategory]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'destructive';
      case 'Moderate': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  const DiseaseCard = ({ disease }: { disease: Disease }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
      onClick={() => setSelectedDisease(disease)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {disease.disease_name}
            </CardTitle>
            {disease.name_hindi && (
              <p className="text-sm text-muted-foreground mt-1">{disease.name_hindi}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className="text-xs">
                {disease.category}
              </Badge>
              <Badge variant={getSeverityColor(disease.severity)} className="text-xs">
                {disease.severity} Risk
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {disease.who_verified && (
              <Badge variant="outline" className="text-xs text-green-700 bg-green-50 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                WHO Verified
              </Badge>
            )}
            {disease.featured && (
              <Badge variant="outline" className="text-xs text-yellow-700 bg-yellow-50 border-yellow-200">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {disease.seasonal && (
              <Badge variant="outline" className="text-xs text-blue-700 bg-blue-50 border-blue-200">
                <Clock className="h-3 w-3 mr-1" />
                Seasonal
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {disease.description}
        </p>
        
        {/* Key symptoms preview */}
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Key Symptoms:</p>
          <div className="flex flex-wrap gap-1">
            {disease.symptoms.slice(0, 3).map((symptom, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {symptom}
              </Badge>
            ))}
            {disease.symptoms.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{disease.symptoms.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {disease.prevalence && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Common</span>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className="text-primary">
            View Details →
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const DiseaseDetail = ({ disease }: { disease: Disease }) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{disease.disease_name}</h2>
          {disease.name_hindi && (
            <p className="text-lg text-muted-foreground mt-1">{disease.name_hindi}</p>
          )}
          {disease.prevalence && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {disease.prevalence}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
            onClick={() => setSelectedDisease(null)}
          >
            ← Back to List
          </Button>
          <Button 
            variant="outline" 
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
          >
            <Phone className="h-4 w-4 mr-2" />
            Quick Consult
          </Button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-sm px-3 py-1">
          📂 {disease.category}
        </Badge>
        <Badge variant={getSeverityColor(disease.severity)} className="text-sm px-3 py-1">
          ⚠️ {disease.severity} Severity
        </Badge>
        {disease.featured && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Star className="h-3 w-3 mr-1" />Featured Disease
          </Badge>
        )}
        {disease.seasonal && (
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />Seasonal
          </Badge>
        )}
        {disease.who_verified && (
          <Badge variant="outline" className="text-sm px-3 py-1 text-green-700 bg-green-50 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            WHO Verified
          </Badge>
        )}
      </div>

      {/* Description */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            📖 About This Disease
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed">{disease.description}</p>
        </CardContent>
      </Card>

      {/* Main Info Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Symptoms */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Signs & Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {disease.symptoms.map((symptom: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-red-50 border border-red-100">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-sm">{symptom}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Treatment */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5 text-green-500" />
              Treatment Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {disease.treatments.map((treatment: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-green-50 border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-sm">{treatment}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Home Remedies */}
        {disease.remedies && disease.remedies.length > 0 && (
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5 text-amber-500" />
                Home Remedies & Care
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {disease.remedies.map((remedy: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-amber-50 border border-amber-100">
                    <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                    <span className="text-sm">{remedy}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Precautions */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Prevention & Precautions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {disease.precautions.map((precaution: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-blue-50 border border-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  <span className="text-sm">{precaution}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Prevalence */}
        {disease.prevalence && (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Prevalence & Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm bg-purple-50 p-3 rounded-md border border-purple-100">
                {disease.prevalence}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Related Diseases */}
        {disease.related_diseases && disease.related_diseases.length > 0 && (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                Related Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {disease.related_diseases.map((relatedDisease: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                    {relatedDisease}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Emergency Warning */}
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            🚨 When to Seek Immediate Medical Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700 mb-2">
            Seek immediate medical attention if you experience:
          </p>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Severe difficulty breathing or chest pain</li>
            <li>• High fever that doesn't respond to medication</li>
            <li>• Signs of dehydration or severe weakness</li>
            <li>• Any symptom that rapidly worsens</li>
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                Medical Disclaimer
              </p>
              <p className="text-sm text-blue-700">
                This information is verified from WHO, CDC, and MoHFW sources. It's for educational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for personalized medical guidance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (selectedDisease) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedDisease(null)}
          className="mb-4"
        >
          ← Back to Disease List
        </Button>
        <DiseaseDetail disease={selectedDisease} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Disease Information Center</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive, WHO-verified information about diseases, symptoms, treatments, and prevention measures. 
          Always consult healthcare professionals for personalized medical advice.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by disease name, symptoms, or treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter by category:</span>
          </div>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
            >
              {category}
              {category !== 'All' && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {diseases.filter(d => d.category === category).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {(isLoading || isInitializing) && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isInitializing ? 'Initializing disease database...' : 'Loading diseases...'}
          </p>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !isInitializing && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <span>All Diseases</span>
              <Badge variant="secondary" className="text-xs">
                {filteredDiseases.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="h-3 w-3" />
              <span>Featured</span>
              <Badge variant="secondary" className="text-xs">
                {featuredDiseases.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Seasonal</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredDiseases.length} disease{filteredDiseases.length !== 1 ? 's' : ''}
                {selectedCategory !== 'All' && ` in ${selectedCategory} category`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDiseases.map((disease) => (
                <DiseaseCard key={disease.id} disease={disease} />
              ))}
            </div>
            
            {filteredDiseases.length === 0 && (
              <Card className="p-8 text-center">
                <div className="space-y-2">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No diseases found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="featured" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Featured Diseases</h2>
              <Badge variant="outline">WHO Verified</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              These are common diseases with comprehensive, verified information from health organizations.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredDiseases.map((disease) => (
                <DiseaseCard key={disease.id} disease={disease} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Seasonal Diseases</h2>
              <Badge variant="outline">Time Sensitive</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Diseases that are more common during specific seasons or weather conditions.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {diseases.filter(d => d.seasonal).map((disease) => (
                <DiseaseCard key={disease.id} disease={disease} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};